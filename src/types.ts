export interface WasaasClientOptions {
  apiKey: string;
  /** @default "https://wasaas.org" */
  baseUrl?: string;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface SendTextParams {
  sessionId: string;
  to: string;
  message: string;
}

export interface SendImageParams {
  sessionId: string;
  to: string;
  imageUrl: string;
  caption?: string;
}

export interface SendDocumentParams {
  sessionId: string;
  to: string;
  /** Base64-encoded file content */
  base64: string;
  filename: string;
  mime: string;
  caption?: string;
}

export interface SendMessageResponse {
  success: true;
  to: string;
  status: "sent";
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  session_id: string;
  phone: string | null;
  status:
    | "connected"
    | "authenticated"
    | "qr_ready"
    | "initializing"
    | "disconnected"
    | "not_started"
    | string;
  created_at: string;
}

// ── Numbers ───────────────────────────────────────────────────────────────────

export interface ValidateNumberParams {
  sessionId: string;
  phone: string;
}

export interface ValidateNumberResponse {
  exists: boolean;
  phone?: string;
}
