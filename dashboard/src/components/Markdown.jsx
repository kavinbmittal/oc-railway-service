import { useMemo } from"react";
import { marked } from"marked";

marked.setOptions({ breaks: true, gfm: true });

// Auto-bold known labels at start of lines (e.g. "what:" → "**what:**")
const LABEL_RE = /^(what|why|impact|goal|context|status|priority|assignee|theme|experiment|deliverable|outcome|hypothesis|method|duration|risk|dependencies|metrics|scope|background|proposal|approach|timeline|budget|resources|success criteria|expected outcome|proxy metric|contribution):/gmi;

function autoFormatLabels(text) {
 return text.replace(LABEL_RE, (match, label) => `**${label}:**`);
}

// Detect if text already has markdown formatting
function hasMarkdown(text) {
 return /^[#*\->]|\n[#*\->]|\*\*|``|^\s*\d+\.\s/m.test(text);
}

// Wrap file-like paths in backticks (e.g. content/queue, PUBLISHING.md)
// Only matches paths that look like directories/files (lowercase, hyphens, dots) — skips
// proper nouns or names separated by slashes (e.g. "Shaan/Keep")
function backtickPaths(text) {
 // Match paths with slashes — require at least one segment to start lowercase or contain a dot/extension
 text = text.replace(/(?<![`\w])((?:[a-z][\w.-]*|\.\.?)\/[\w./-]+\w)(?=[.,;:!?)}\s]|$)(?![`])/g, "`$1`");
 // Match standalone filenames with extensions
 text = text.replace(/(?<![`\/\w])(\w[\w-]*\.(?:md|json|js|ts|jsx|tsx|yaml|yml|sh|sql|csv|tsv|txt|py|toml))\b(?![`])/g, "`$1`");
 return text;
}

// Auto-bold action/status words when they appear as sentence openers or labels
const STATUS_RE = /(?:^|(?<=\.\s)|(?<=\n))(Verified|Done|Completed|Blocked|Awaiting|Updated|Created|Fixed|Resolved|Shipped|Deployed|Published|Archived|Approved|Rejected|Confirmed|All success criteria (?:already )?met):/gi;

function autoFormatStatus(text) {
 return text.replace(STATUS_RE, (match, label) => `**${label}:**`);
}

// Convert "label: item1, item2, item3" into a bullet list when 2+ comma items.
// Works on full single-line text — splits at first colon, then commas for the list portion,
// and any trailing sentences (after the list) become separate bullets.
function commaListToBullets(text) {
 return text.replace(/^(.+?):\s*(.+(?:,\s*.+){1,})$/gm, (match, label, rest) => {
  // Split trailing sentences off the last comma item (e.g. "item3. Next sentence.")
  // by finding the last comma item and checking for ". " after it
  const segments = rest.split(/\.\s+(?=[A-Z])/);
  // First segment contains the comma list (possibly with a trailing period)
  const listPart = segments[0].replace(/\.+$/, "").trim();
  const parts = listPart.split(/,\s*/).map(s => s.replace(/\.+$/, "").trim()).filter(Boolean);
  if (parts.length < 2) return match;
  const bullets = parts.map(p => `- ${p}`);
  // Remaining segments are trailing sentences — also bullet them
  for (let i = 1; i < segments.length; i++) {
   const s = segments[i].replace(/\.+$/, "").trim();
   if (s) bullets.push(`- ${s}`);
  }
  return `**${label}:**\n${bullets.join("\n")}`;
 });
}

// For flat single-paragraph agent text: convert sentences into bullet points.
// Skipped if commaListToBullets already structured the text (introduced newlines).
function sentencesToBullets(text) {
 if (text.includes("\n") || text.length < 120) return text;
 const sentences = text.split(/\.\s+(?=[A-Z])/).map(s => s.replace(/\.+$/, "").trim()).filter(Boolean);
 if (sentences.length < 2) return text;
 return sentences.map(s => `- ${s}`).join("\n");
}

// Full pre-processing pipeline for agent-style text
function autoFormat(text) {
 if (hasMarkdown(text)) {
  // Already has markdown — just apply label formatting
  return autoFormatLabels(text);
 }
 // Flat text: apply full formatting pipeline
 // 1. Comma lists first (operates on raw single-line text)
 text = commaListToBullets(text);
 // 2. Sentence bullets for remaining flat text (skips if already has newlines)
 text = sentencesToBullets(text);
 // 3. Inline formatting
 text = autoFormatLabels(text);
 text = autoFormatStatus(text);
 text = backtickPaths(text);
 return text;
}

export default function Markdown({ content, className ="" }) {
 const html = useMemo(() => {
  if (!content) return"";
  return marked.parse(autoFormat(content));
 }, [content]);

 return (
  <div
   className={`mc-prose text-[14px] ${className}`}
   dangerouslySetInnerHTML={{ __html: html }}
  />
 );
}
