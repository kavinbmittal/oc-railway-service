/**
 * Lia Compaction Provider — Q&A-preserving compaction for OpenClaw.
 *
 * Replaces OpenClaw's generic summarization with a structured prompt that
 * preserves conversation structure: Q&A pairs, decisions, commitments,
 * emotional context, and tool actions.
 *
 * OpenClaw handles:
 * - When to compact (threshold detection, token counting)
 * - Which messages to compact (recent-turn preservation, split boundaries)
 * - Persisting the compaction entry in the transcript
 * - Falling back to built-in summarization if we fail
 *
 * We handle:
 * - Formatting messages into a readable transcript
 * - Calling the LLM with our structured prompt
 * - Returning the summary string
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk/core";
import { SYSTEM_PROMPT, buildUserMessage } from "./src/prompt.js";

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-6";
const TIMEOUT_MS = 60_000;

type ContentBlock = {
  type: string;
  text?: string;
  name?: string;
  input?: unknown;
  content?: string | unknown[];
  tool_use_id?: string;
};

type Message = {
  role: string;
  content: string | ContentBlock[];
};

/** Extract readable text from a message, handling all content block types. */
function extractText(msg: Message): string {
  if (typeof msg.content === "string") return msg.content;
  if (!Array.isArray(msg.content)) return JSON.stringify(msg.content);

  return (msg.content as ContentBlock[])
    .map((block) => {
      if (block.type === "text" && block.text) return block.text;
      if (block.type === "tool_use") {
        const input =
          typeof block.input === "string"
            ? block.input
            : JSON.stringify(block.input, null, 2);
        return `[Tool call: ${block.name}]\n${input}`;
      }
      if (block.type === "tool_result") {
        const content =
          typeof block.content === "string"
            ? block.content
            : JSON.stringify(block.content);
        return `[Tool result: ${block.tool_use_id ?? "unknown"}]\n${content}`;
      }
      // Images, documents — note their presence but don't dump binary
      if (block.type === "image") return "[Image attachment]";
      if (block.type === "document") return "[Document attachment]";
      return `[${block.type}]`;
    })
    .filter(Boolean)
    .join("\n");
}

/** Format messages into a readable transcript for the LLM. */
function formatTranscript(messages: Message[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      const text = extractText(msg);
      // Skip empty messages
      if (!text.trim()) return null;
      return `**${role}:**\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

/** Resolve API key from OpenClaw config env, then process.env. */
function resolveApiKey(
  configEnv: Record<string, string>,
  provider: string,
): string | undefined {
  const envVarMap: Record<string, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GOOGLE_AI_API_KEY",
  };
  const envVar = envVarMap[provider];
  if (!envVar) return undefined;
  return configEnv[envVar] || process.env[envVar];
}

function register(api: OpenClawPluginApi): void {
  const pluginConfig = (api.pluginConfig ?? {}) as Record<string, unknown>;
  const model = (pluginConfig.model as string) ?? DEFAULT_MODEL;
  const provider = model.includes("/") ? model.split("/")[0] : "anthropic";
  const modelId = model.includes("/") ? model.split("/").slice(1).join("/") : model;

  const configEnv = (
    (api.config as Record<string, unknown>)?.env ?? {}
  ) as Record<string, string>;
  const apiKey = resolveApiKey(configEnv, provider);

  const logger = {
    info: (...args: unknown[]) => api.logger.info?.(args.map(String).join(" ")),
    warn: (...args: unknown[]) => api.logger.warn?.(args.map(String).join(" ")),
    error: (...args: unknown[]) => api.logger.error?.(args.map(String).join(" ")),
  };

  if (!apiKey) {
    logger.error(
      `[lia-compaction] No API key for provider "${provider}" — compaction will fall back to OpenClaw built-in`,
    );
  }

  // Register the compaction provider with OpenClaw's global registry.
  // We import registerCompactionProvider at runtime since it's a global function,
  // not on the plugin API (plugins that aren't context engines use this pattern).
  import("openclaw/plugin-sdk/core")
    .then((sdk) => {
      // The function might be on different paths depending on OpenClaw version
      const registerFn =
        (sdk as Record<string, unknown>).registerCompactionProvider ??
        null;

      if (typeof registerFn !== "function") {
        // Try the direct module path
        return import(
          // @ts-expect-error — path exists at runtime in OpenClaw v2026.4.5+
          "openclaw/dist/plugins/compaction-provider.js"
        ).then((mod) => {
          if (typeof mod.registerCompactionProvider === "function") {
            mod.registerCompactionProvider(
              {
                id: "lia-compaction",
                label: "Lia Q&A Compaction",
                summarize: buildSummarizer(modelId, apiKey, logger),
              },
              { ownerPluginId: "lia-compaction" },
            );
            logger.info(`[lia-compaction] Registered compaction provider (model: ${model})`);
          } else {
            logger.error(
              "[lia-compaction] registerCompactionProvider not found — is OpenClaw v2026.4.5+?",
            );
          }
        });
      }

      (
        registerFn as (
          provider: { id: string; label: string; summarize: SummarizeFn },
          opts?: { ownerPluginId?: string },
        ) => void
      )(
        {
          id: "lia-compaction",
          label: "Lia Q&A Compaction",
          summarize: buildSummarizer(modelId, apiKey, logger),
        },
        { ownerPluginId: "lia-compaction" },
      );
      logger.info(`[lia-compaction] Registered compaction provider (model: ${model})`);
    })
    .catch((err) => {
      logger.error(`[lia-compaction] Failed to register: ${err}`);
    });

  logger.info(`[lia-compaction] Plugin loaded (model: ${model})`);
}

type SummarizeFn = (params: {
  messages: unknown[];
  signal?: AbortSignal;
  compressionRatio?: number;
  customInstructions?: string;
  summarizationInstructions?: {
    identifierPolicy?: "strict" | "off" | "custom";
    identifierInstructions?: string;
  };
  previousSummary?: string;
}) => Promise<string>;

type Logger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

function buildSummarizer(
  modelId: string,
  apiKey: string | undefined,
  logger: Logger,
): SummarizeFn {
  return async (params) => {
    const messages = params.messages as Message[];
    if (messages.length === 0) return "";

    const transcript = formatTranscript(messages);
    if (!transcript.trim()) return "";

    const userMessage = buildUserMessage(transcript, {
      previousSummary: params.previousSummary,
      compressionRatio: params.compressionRatio,
      customInstructions: params.customInstructions,
      identifierInstructions:
        params.summarizationInstructions?.identifierInstructions,
    });

    logger.info(
      `[lia-compaction] Summarizing ${messages.length} messages (${transcript.length} chars)`,
    );

    // Call Anthropic SDK directly — simple, no internal routing dependency
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic(apiKey ? { apiKey } : undefined);

    const response = await client.messages.create(
      {
        model: modelId,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user" as const, content: userMessage }],
      },
      {
        timeout: TIMEOUT_MS,
        signal: params.signal,
      },
    );

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    if (!text.trim()) {
      logger.warn("[lia-compaction] LLM returned empty summary");
      return "";
    }

    logger.info(
      `[lia-compaction] Compaction complete (${text.length} chars summary, ${response.usage.input_tokens} in / ${response.usage.output_tokens} out)`,
    );

    return text;
  };
}

const liaCompactionPlugin = {
  id: "lia-compaction",
  name: "Lia Compaction",
  description:
    "Q&A-preserving compaction — keeps conversation structure, decisions, commitments, and emotional context intact.",
  configSchema: {
    jsonSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          default: DEFAULT_MODEL,
          description: "Model for summarization (provider/model format)",
        },
      },
    },
    parse(value: unknown) {
      return value ?? {};
    },
  },
  register,
};

export default liaCompactionPlugin;
