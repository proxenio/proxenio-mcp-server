// Proxenio API Client
// Handles all HTTP communication with the Proxenio agent API

import {
  PROXENIO_API_BASE,
  API_KEY_HEADER,
  API_KEY_PREFIX,
  API_KEY_LENGTH,
  REQUEST_TIMEOUT_MS,
} from "../constants.js";
import type {
  MatchesResponse,
  AcceptResponse,
  RateLimitHeaders,
} from "../types.js";

let apiKey: string | null = null;

/**
 * Set the API key for all subsequent requests.
 * Validates format before storing.
 */
export function setApiKey(key: string): void {
  if (!key.startsWith(API_KEY_PREFIX)) {
    throw new Error(
      `Invalid API key format. Key must start with '${API_KEY_PREFIX}'. ` +
      `Generate a key at https://www.proxenio.ai/agents`
    );
  }
  if (key.length !== API_KEY_LENGTH) {
    throw new Error(
      `Invalid API key length. Expected ${API_KEY_LENGTH} characters, got ${key.length}. ` +
      `Generate a key at https://www.proxenio.ai/agents`
    );
  }
  apiKey = key;
}

/**
 * Get the current API key, or throw if not set.
 */
export function getApiKey(): string {
  if (!apiKey) {
    throw new Error(
      "No API key configured. Use the proxenio_set_api_key tool first. " +
      "If you don't have a key, the human principal must generate one at https://www.proxenio.ai/agents"
    );
  }
  return apiKey;
}

/**
 * Check if an API key is currently configured.
 */
export function hasApiKey(): boolean {
  return apiKey !== null;
}

/**
 * Extract rate limit headers from a fetch Response.
 */
function extractRateLimitHeaders(response: Response): RateLimitHeaders {
  return {
    limit: parseInt(response.headers.get("X-RateLimit-Limit") ?? "60", 10),
    remaining: parseInt(response.headers.get("X-RateLimit-Remaining") ?? "0", 10),
    reset: response.headers.get("X-RateLimit-Reset") ?? "",
  };
}

/**
 * Make an authenticated request to the Proxenio agent API.
 */
async function makeRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, unknown>
): Promise<{ data: T; rateLimit: RateLimitHeaders }> {
  const key = getApiKey();
  const url = `${PROXENIO_API_BASE}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        [API_KEY_HEADER]: key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    const rateLimit = extractRateLimitHeaders(response);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      })) as Record<string, unknown>;

      const errorMessage = (errorBody.error as string) ?? `HTTP ${response.status}`;

      switch (response.status) {
        case 401:
          throw new Error(
            `Authentication failed: ${errorMessage}. ` +
            `Check that your API key is valid and not revoked. ` +
            `Generate a new key at https://www.proxenio.ai/agents`
          );
        case 403:
          throw new Error(
            `Access denied: ${errorMessage}. ` +
            `The principal may not be authorized for this action.`
          );
        case 404:
          throw new Error(`Not found: ${errorMessage}.`);
        case 429:
          throw new Error(
            `Rate limit exceeded: ${errorMessage}. ` +
            `Limit: ${rateLimit.limit}/hour. ` +
            `Resets at: ${rateLimit.reset}. ` +
            `Wait before making more requests.`
          );
        default:
          throw new Error(`API error (${response.status}): ${errorMessage}`);
      }
    }

    const data = (await response.json()) as T;
    return { data, rateLimit };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. ` +
        `The Proxenio API may be temporarily unavailable. Try again.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * GET /api/agent/matches — Read the principal's matches.
 */
export async function getMatches(): Promise<{
  data: MatchesResponse;
  rateLimit: RateLimitHeaders;
}> {
  return makeRequest<MatchesResponse>("/matches");
}

/**
 * POST /api/agent/matches/accept — Accept an introduction.
 */
export async function acceptMatch(matchId: string): Promise<{
  data: AcceptResponse;
  rateLimit: RateLimitHeaders;
}> {
  return makeRequest<AcceptResponse>("/matches/accept", "POST", {
    match_id: matchId,
  });
}
