import type { UserRole } from "@/generated/prisma";

export type { UserRole };

export const ROLE_LABELS: Record<UserRole, string> = {
  HEAD: "Руководитель",
  SENIOR_BROKER: "Старший брокер",
  BROKER: "Брокер",
  RESEARCH: "Аналитик",
};

/** Can create or edit deals */
export function canEdit(role: UserRole): boolean {
  return role === "HEAD" || role === "SENIOR_BROKER" || role === "BROKER";
}

/** Can delete deals */
export function canDelete(role: UserRole): boolean {
  return role === "HEAD";
}

/** Sees all brokers' deals; otherwise filtered to own brokerName */
export function seeAllBrokers(role: UserRole): boolean {
  return role === "HEAD" || role === "SENIOR_BROKER" || role === "RESEARCH";
}

/** Can manage users */
export function canManageUsers(role: UserRole): boolean {
  return role === "HEAD";
}
