const POST_LOGIN_REDIRECT_BASE_URL = "https://gather.local";
const BLOCKED_POST_LOGIN_PATHS = [
  "/login",
  "/signup",
  "/account-recovery",
  "/my/profile/password",
] as const;

function isSafeInternalPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
}

function isBlockedPostLoginPath(pathname: string) {
  return BLOCKED_POST_LOGIN_PATHS.some(
    (blockedPath) =>
      pathname === blockedPath || pathname.startsWith(`${blockedPath}/`),
  );
}

export function getSafePostLoginReturnPath(value: unknown): string | null {
  if (!isSafeInternalPath(value)) {
    return null;
  }

  try {
    const url = new URL(value, POST_LOGIN_REDIRECT_BASE_URL);

    if (
      url.origin !== POST_LOGIN_REDIRECT_BASE_URL ||
      isBlockedPostLoginPath(url.pathname)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return value;
}
