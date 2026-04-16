export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string };
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** Base result from AI document parsing. Extend per domain. */
export interface AiParseResult {
  /** Structured key-value pairs extracted from the document */
  fields: Record<string, string | number | boolean | null>;
  /** AI confidence score 0-1 */
  confidence: number;
  /** Raw text response from the model (for debugging) */
  raw?: string;
}

/** Configuration for an AI parsing skill */
export interface AiSkillConfig {
  /** Unique skill identifier */
  name: string;
  /** System prompt sent to Gemini */
  prompt: string;
  /** Expected fields in the response (for validation) */
  expectedFields?: string[];
}
