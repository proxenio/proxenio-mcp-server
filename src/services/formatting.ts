// Response formatting for Proxenio MCP tools

import type {
  Match,
  MatchesResponse,
  AcceptResponse,
  RateLimitHeaders,
} from "../types.js";

/**
 * Format a trust tier number to its label.
 */
function tierLabel(tier: number): string {
  const labels: Record<number, string> = {
    0: "Unverified",
    1: "Starter",
    2: "Active",
    3: "Trusted",
    4: "Proven",
  };
  return labels[tier] ?? `Tier ${tier}`;
}

/**
 * Format a single match as readable markdown.
 */
function formatMatch(match: Match, index: number): string {
  const cp = match.counterparty;
  const lines: string[] = [];

  lines.push(`### ${index + 1}. ${cp.name} — ${cp.role}`);
  lines.push(`**Score**: ${match.match_score}/100 (${match.match_type}) · **Status**: ${match.status}`);
  lines.push(`**Industry**: ${cp.industry} · **Location**: ${cp.location}${cp.company ? ` · **Company**: ${cp.company}` : ""}`);
  lines.push(`**Intent**: ${cp.intent_type}${cp.intent_description ? ` — ${cp.intent_description}` : ""}`);
  lines.push(`**Trust**: ${tierLabel(cp.trust_tier)} · **PRO Score**: ${cp.pro_score} · **Verified**: ${cp.is_verified ? "Yes" : "No"} · **Confirmed outcomes**: ${cp.confirmed_outcomes}`);
  lines.push(`**Match ID**: \`${match.match_id}\``);
  lines.push("");

  return lines.join("\n");
}

/**
 * Format the full matches response as markdown.
 */
export function formatMatchesMarkdown(
  response: MatchesResponse,
  rateLimit: RateLimitHeaders
): string {
  const lines: string[] = [];
  const p = response.principal;

  lines.push("# Proxenio Matches");
  lines.push("");
  lines.push(`**Principal**: ${p.name} · ${tierLabel(p.trust_tier)} · PRO Score ${p.pro_score}`);
  lines.push(`**Total matches**: ${response.meta.total_matches} · **Requests remaining**: ${rateLimit.remaining}/${rateLimit.limit}/hr`);
  lines.push("");

  if (response.matches.length === 0) {
    lines.push("No matches found. The principal may need to complete their profile, declare intent, or build more trust.");
  } else {
    response.matches.forEach((match, i) => {
      lines.push(formatMatch(match, i));
    });
  }

  return lines.join("\n");
}

/**
 * Format the accept response as markdown.
 */
export function formatAcceptMarkdown(
  response: AcceptResponse,
  rateLimit: RateLimitHeaders
): string {
  const cp = response.match.counterparty;
  const lines: string[] = [];

  lines.push("# Introduction Accepted ✓");
  lines.push("");
  lines.push(`**Counterparty**: ${cp.name} — ${cp.role}, ${cp.industry}`);
  lines.push(`**Match ID**: \`${response.match.match_id}\``);
  lines.push(`**Deal created**: \`${response.deal_id}\``);
  lines.push(`**Agent**: ${response.meta.agent}`);
  lines.push(`**Requests remaining**: ${rateLimit.remaining}/${rateLimit.limit}/hr`);
  lines.push("");
  lines.push("The introduction is now connected. The human principal should follow up to close the deal and log outcomes.");

  return lines.join("\n");
}
