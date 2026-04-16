import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import type { UserRole } from "@starter/shared";

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const { data, error } =
      await this.supabase.auth.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw new UnauthorizedException(
        error?.message ?? "Invalid credentials",
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email },
    };
  }

  async register(email: string, password: string) {
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw new BadRequestException(error.message);
    return this.login(email, password);
  }

  async refresh(refreshToken: string) {
    const { data, error } =
      await this.supabase.auth.auth.refreshSession({
        refresh_token: refreshToken,
      });
    if (error || !data.session)
      throw new UnauthorizedException("Invalid refresh token");
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    };
  }

  async getMe(userId: string) {
    const role = await this.getUserRole(userId);
    const { data } =
      await this.supabase.admin.auth.admin.getUserById(userId);
    return { id: userId, email: data.user?.email, role };
  }

  async getUserRole(userId: string): Promise<UserRole> {
    const { data } = await this.supabase.admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    return (data?.role as UserRole) ?? "user";
  }

  async logout(accessToken: string) {
    await this.supabase.admin.auth.admin.signOut(accessToken);
  }
}
