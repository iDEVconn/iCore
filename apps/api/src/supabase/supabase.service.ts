import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient;
  private anonClient: SupabaseClient;

  constructor(private config: ConfigService) {
    const url = this.config.getOrThrow("SUPABASE_URL");

    this.adminClient = createClient(
      url,
      this.config.getOrThrow("SUPABASE_SERVICE_ROLE_KEY"),
    );

    this.anonClient = createClient(
      url,
      this.config.getOrThrow("SUPABASE_ANON_KEY"),
    );
  }

  /** Admin client — bypasses RLS. Use for DB operations. */
  get admin(): SupabaseClient {
    return this.adminClient;
  }

  /** Anon client — for auth operations (signIn, signUp, refreshSession). */
  get auth(): SupabaseClient {
    return this.anonClient;
  }

  /** Verify a user's access token. Returns the user or throws. */
  async verifyToken(token: string) {
    const { data, error } = await this.adminClient.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Invalid token");
    }
    return data.user;
  }
}
