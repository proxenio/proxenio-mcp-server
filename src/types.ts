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
  match_type: "premium" | "strong" | "regular";
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

export interface DealCounterparty {
  id: string;
  name: string;
  role: string;
  industry: string;
  location: string;
  company?: string;
  trust_tier: number;
  pro_score: number;
  is_verified: boolean;
}

export interface DealOutcome {
  outcome_id: string;
  outcome_type: string;
  outcome_description?: string;
  logged_by: "principal" | "counterparty";
  confirmation_status: "pending" | "confirmed" | "disputed" | "expired";
  created_at: string;
}

export interface Deal {
  deal_id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  counterparty: DealCounterparty;
  outcomes: DealOutcome[];
  match_id: string;
}

export interface DealsMeta {
  agent: string;
  scope: string;
  total_deals: number;
  requests_remaining: number;
  timestamp: string;
}

export interface DealsResponse {
  principal: Principal;
  deals: Deal[];
  meta: DealsMeta;
}

export interface IntroRequestResponse {
  success: true;
  action: "intro_request_pending_approval";
  status: "agent_pending";
  match: {
    match_id: string;
    counterparty: {
      name: string;
      role: string;
      industry: string;
    };
  };
  message: string;
  meta: {
    agent: string;
    scope: string;
    principal_id: string;
    timestamp: string;
  };
}

export interface OutcomeResponse {
  success: true;
  action: "outcome_pending_approval";
  status: "agent_pending";
  deal: {
    deal_id: string;
    counterparty: {
      name: string;
      role: string;
      industry: string;
    };
  };
  outcome_type: string;
  message: string;
  meta: {
    agent: string;
    scope: string;
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
