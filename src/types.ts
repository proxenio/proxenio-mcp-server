// Proxenio API Type Definitions

export interface Principal {
  id: string;
  name: string;
  trust_tier: number;
  pro_score: number;
}

export interface Counterparty {
  id: string;
  name: string;
  role: string;
  industry: string;
  location: string;
  company?: string;
  intent_type: string;
  intent_description?: string;
  trust_tier: number;
  pro_score: number;
  is_verified: boolean;
  confirmed_outcomes: number;
}

export interface Match {
  match_id: string;
  status: "pending" | "accepted";
  match_score: number;
  match_type: "top" | "high" | "standard";
  created_at: string;
  counterparty: Counterparty;
}

export interface MatchesMeta {
  agent: string;
  scope: string;
  total_matches: number;
  requests_remaining: number;
  timestamp: string;
}

export interface MatchesResponse {
  principal: Principal;
  matches: Match[];
  meta: MatchesMeta;
}

export interface AcceptResponse {
  success: true;
  action: "accepted";
  match: {
    match_id: string;
    status: "accepted";
    counterparty: {
      id: string;
      name: string;
      role: string;
      industry: string;
    };
  };
  deal_id: string;
  meta: {
    agent: string;
    principal_id: string;
    timestamp: string;
  };
}

export interface ProxenioError {
  error: string;
}

export interface RateLimitError {
  error: string;
  retry_after: number;
  reset_at: string;
}

export interface RateLimitHeaders {
  limit: number;
  remaining: number;
  reset: string;
}
