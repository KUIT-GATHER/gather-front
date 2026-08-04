import { HttpResponse } from "msw";

const ACCESS_TOKEN_PATTERN = /^Bearer mock-access-token-(\d+)-\d+$/;
const REFRESH_TOKEN_PATTERN = /^mock-refresh-token-(\d+)-\d+$/;

export function createMockAccessToken(userId: number) {
  return `mock-access-token-${userId}-${Date.now()}`;
}

export function createMockRefreshToken(userId: number) {
  return `mock-refresh-token-${userId}-${Date.now()}`;
}

export function getMockUserId(request: Request) {
  const authorization = request.headers.get("Authorization");
  const match = authorization?.match(ACCESS_TOKEN_PATTERN);

  return match ? Number(match[1]) : null;
}

export function getMockUserIdFromRefreshToken(refreshToken: string) {
  const match = refreshToken.match(REFRESH_TOKEN_PATTERN);

  return match ? Number(match[1]) : null;
}

export function createUnauthorizedResponse() {
  return HttpResponse.json(
    {
      success: false,
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "인증 정보가 없습니다.",
      },
    },
    { status: 401 },
  );
}
