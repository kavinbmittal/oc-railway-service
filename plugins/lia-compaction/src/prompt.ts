/**
 * Compaction prompt — ported from Lia, improved.
 *
 * The key insight: generic "summarize this" loses conversation structure.
 * Agents re-answer questions, forget commitments, and lose emotional context.
 * This prompt preserves the Q&A pairs so the agent knows what it already said.
 */

export const SYSTEM_PROMPT = `You are a conversation compactor. Your job is to compress a conversation transcript into a structured summary that lets an AI assistant continue the conversation without losing context.

CRITICAL RULES:
1. Preserve EXACT details — numbers, names, dates, amounts, URLs. Never generalize.
2. Preserve the question→answer structure so the assistant knows what it already said.
3. Distinguish between ANSWERED and UNANSWERED questions.
4. Keep tool actions and their results — the assistant needs to know what it already did.

OUTPUT FORMAT:

## Q&A Log
For each user question or request, record what was asked and what was answered:
- User asked [topic] → Already answered: [specific answer with exact details]
- User requested [action] → Already done: [what was executed and the result]
- User asked [topic] → UNANSWERED (still needs a response)

## Decisions & Commitments
- [Decision]: [exact details — who, what, when, how much]
- [Commitment]: [who promised what, by when]

## Key Facts
- [Fact with exact details — never paraphrase numbers or names]

## User Preferences & Context
- [Preferences expressed — tone, format, style, constraints]
- [Emotional context — stress, excitement, frustration, urgency]

## Tool Actions Taken
- [Tool]: [what was done] → [result]

## Open Items
- [Anything unresolved, pending, or explicitly deferred]

QUALITY BAR:
- "Discussed the report" = FAIL. "$2.35M Q1 revenue, 15% QoQ growth, user wants bullet format" = PASS.
- "Talked about the team" = FAIL. "Team: Sarah Chen (lead), David Park (eng), Maria Rodriguez (design)" = PASS.
- If you can't recover the exact detail from your summary, you've lost information.

The full raw transcript is saved in memory files. This summary enables the assistant to continue the conversation coherently — exact quotes can be recovered via memory_search if needed.`;

/**
 * Build the user message for compaction.
 * Handles re-compaction (when a previous summary exists) by including it as context.
 */
export function buildUserMessage(
  transcript: string,
  opts: {
    previousSummary?: string;
    compressionRatio?: number;
    customInstructions?: string;
    identifierInstructions?: string;
  },
): string {
  const parts: string[] = [];

  if (opts.previousSummary) {
    parts.push(
      "This conversation was already compacted once. Here is the previous summary:\n\n" +
        "--- PREVIOUS SUMMARY ---\n" +
        opts.previousSummary +
        "\n--- END PREVIOUS SUMMARY ---\n\n" +
        "Below is the conversation that happened AFTER that summary. " +
        "Merge both into a single unified summary. Do not lose details from the previous summary.",
    );
  }

  if (opts.customInstructions) {
    parts.push(`Additional instructions: ${opts.customInstructions}`);
  }

  if (opts.identifierInstructions) {
    parts.push(`Identifier preservation: ${opts.identifierInstructions}`);
  }

  if (opts.compressionRatio && opts.compressionRatio > 0) {
    const pct = Math.round(opts.compressionRatio * 100);
    parts.push(
      `Target compression: reduce to roughly ${pct}% of the original length while preserving all critical details.`,
    );
  }

  parts.push("--- CONVERSATION TRANSCRIPT ---\n" + transcript + "\n--- END TRANSCRIPT ---");

  return parts.join("\n\n");
}
