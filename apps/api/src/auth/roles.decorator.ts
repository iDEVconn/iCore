import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "./auth.guard";
import type { UserRole } from "@starter/shared";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
