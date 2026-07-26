import { HttpResponse } from "msw";

const ACCESS_TOKEN_PATTERN = /^Bearer mock-access-token-(\d+)-\d+$/;

export function getMockUserId(request: Request) {
  const authorization = request.headers.get("Authorization");
  const match = authorization?.match(ACCESS_TOKEN_PATTERN);

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
