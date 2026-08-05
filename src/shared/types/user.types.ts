export type UserStatus = "ACTIVE" | "WITHDRAWN";

export function resolveUserStatus(userStatus?: UserStatus): UserStatus {
  return userStatus ?? "ACTIVE";
}
