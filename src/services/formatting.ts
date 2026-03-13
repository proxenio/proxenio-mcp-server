// Response formatting for Proxenio MCP tools

import type {
  Match,
  MatchesResponse,
  AcceptResponse,
  Deal,
  DealsResponse,
  IntroRequestResponse,
  OutcomeResponse,
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

/**
 * Format a single deal as readable markdown.
 */
function formatDeal(deal: Deal, index: number): string {
  const cp = deal.counterparty;
  const lines: string[] = [];

  lines.push(`### ${index + 1}. ${cp.name} — ${cp.role}`);
  lines.push(`**Status**: ${deal.status} · **Created**: ${deal.created_at}`);
  lines.push(`**Industry**: ${cp.industry} · **Location**: ${cp.location}${cp.company ? ` · **Company**: ${cp.company}` : ""}`);
  lines.push(`**Trust**: ${tierLabel(cp.trust_tier)} · **PRO Score**: ${cp.pro_score} · **Verified**: ${cp.is_verified ? "Yes" : "No"}`);
  lines.push(`**Deal ID**: \`${deal.deal_id}\` · **Match ID**: \`${deal.match_id}\``);

  if (deal.outcomes.length > 0) {
    lines.push("");
    lines.push("**Outcomes:**");
    deal.outcomes.forEach((o) => {
      lines.push(`- ${o.outcome_type} (${o.confirmation_status}) — logged by ${o.logged_by}, ${o.created_at}`);
      if (o.outcome_description) {
        lines.push(`  ${o.outcome_description}`);
      }
    });
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Format the full deals response as markdown.
 */
export function formatDealsMarkdown(
  response: DealsResponse,
  rateLimit: RateLimitHeaders
): string {
  const lines: string[] = [];
  const p = response.principal;

  lines.push("# Proxenio Deals");
  lines.push("");
  lines.push(`**Principal**: ${p.name} · ${tierLabel(p.trust_tier)} · PRO Score ${p.pro_score}`);
  lines.push(`**Total deals**: ${response.meta.total_deals} · **Requests remaining**: ${rateLimit.remaining}/${rateLimit.limit}/hr`);
  lines.push("");

  if (response.deals.length === 0) {
    lines.push("No deals found. Accept introductions to create deals.");
  } else {
    response.deals.forEach((deal, i) => {
      lines.push(formatDeal(deal, i));
    });
  }

  return lines.join("\n");
}

/**
 * Format the intro request response as markdown.
 */
export function formatIntroRequestMarkdown(
  response: IntroRequestResponse,
  rateLimit: RateLimitHeaders
): string {
  const cp = response.match.counterparty;
  const lines: string[] = [];

  lines.push("# Introduction Request Pending Approval");
  lines.push("");
  lines.push(`**Counterparty**: ${cp.name} — ${cp.role}, ${cp.industry}`);
  lines.push(`**Match ID**: \`${response.match.match_id}\``);
  lines.push(`**Status**: ${response.status}`);
  lines.push(`**Agent**: ${response.meta.agent}`);
  lines.push(`**Requests remaining**: ${rateLimit.remaining}/${rateLimit.limit}/hr`);
  lines.push("");
  lines.push(response.message);

  return lines.join("\n");
}

/**
 * Format the outcome response as markdown.
 */
export function formatOutcomeMarkdown(
  response: OutcomeResponse,
  rateLimit: RateLimitHeaders
): string {
  const cp = response.deal.counterparty;
  const lines: string[] = [];

  lines.push("# Outcome Pending Approval");
  lines.push("");
  lines.push(`**Counterparty**: ${cp.name} — ${cp.role}, ${cp.industry}`);
  lines.push(`**Deal ID**: \`${response.deal.deal_id}\``);
  lines.push(`**Outcome type**: ${response.outcome_type}`);
  lines.push(`**Status**: ${response.status}`);
  lines.push(`**Agent**: ${response.meta.agent}`);
  lines.push(`**Requests remaining**: ${rateLimit.remaining}/${rateLimit.limit}/hr`);
  lines.push("");
  lines.push(response.message);

  return lines.join("\n");
}
