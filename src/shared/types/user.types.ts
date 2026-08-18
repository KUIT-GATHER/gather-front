export type LoginType = "EMAIL" | "KAKAO";

export type UserStatus = "ACTIVE" | "WITHDRAWN";

export function resolveUserStatus(userStatus?: UserStatus): UserStatus {
  return userStatus ?? "ACTIVE";
}

export function getPublicNickname(
  nickname: string,
  userStatus?: UserStatus,
): string {
  return resolveUserStatus(userStatus) === "WITHDRAWN"
    ? "탈퇴한 사용자"
    : nickname;
}
