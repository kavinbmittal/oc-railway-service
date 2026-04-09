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
declare function register(api: OpenClawPluginApi): void;
declare const liaCompactionPlugin: {
    id: string;
    name: string;
    description: string;
    configSchema: {
        jsonSchema: {
            type: string;
            properties: {
                model: {
                    type: string;
                    default: string;
                    description: string;
                };
            };
        };
        parse(value: unknown): {};
    };
    register: typeof register;
};
export default liaCompactionPlugin;
