import { HttpResponse, http } from "msw";

type SignupRequest = {
  name?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
  introduction?: string;
  activityRegionIds?: number[];
  interestCategoryIds?: number[];
  serviceTermsAgreed?: boolean;
  privacyPolicyAgreed?: boolean;
  marketingAgreed?: boolean;
};

export const authHandlers = [
  http.post("*/api/v1/auth/phone-numbers/availability", async ({ request }) => {
    const body = (await request.json()) as { phoneNumber?: string };
    const phoneNumber = body.phoneNumber
      ?.replaceAll("-", "")
      .replaceAll(" ", "");

    if (!phoneNumber || !/^\d{10,11}$/.test(phoneNumber)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        phoneNumber,
        available: phoneNumber !== "01012345678",
      },
      error: null,
    });
  }),

  http.post("*/api/v1/auth/email-verifications", async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        email,
        expiresAt: "2026-06-28T12:10:00",
        message: "인증 코드가 발송되었습니다.",
      },
      error: null,
    });
  }),

  http.post(
    "*/api/v1/auth/email-verifications/confirm",
    async ({ request }) => {
      const body = (await request.json()) as {
        email?: string;
        code?: string;
      };

      const email = body.email?.trim().toLowerCase();
      const code = body.code;

      if (!email || !code) {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "요청 값이 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      if (code !== "123456") {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "INVALID_VERIFICATION_CODE",
              message: "인증 코드가 올바르지 않습니다.",
            },
          },
          { status: 400 },
        );
      }

      return HttpResponse.json({
        success: true,
        data: {
          email,
          verified: true,
          verifiedAt: "2026-06-28T12:05:00",
        },
        error: null,
      });
    },
  ),

  http.post("*/api/v1/auth/signup", async ({ request }) => {
    const body = (await request.json()) as SignupRequest;

    if (!body.email || !body.password || !body.name || !body.nickname) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "요청 값이 올바르지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (body.password !== body.passwordConfirm) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "PASSWORD_MISMATCH",
            message: "비밀번호가 일치하지 않습니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!body.serviceTermsAgreed || !body.privacyPolicyAgreed) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "REQUIRED_TERMS_NOT_AGREED",
            message: "필수 약관 동의가 필요합니다.",
          },
        },
        { status: 400 },
      );
    }

    if (
      !body.activityRegionIds ||
      body.activityRegionIds.length < 1 ||
      body.activityRegionIds.length > 3
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_ACTIVITY_REGION_COUNT",
            message: "활동 지역은 1개 이상 3개 이하로 선택해야 합니다.",
          },
        },
        { status: 400 },
      );
    }

    if (!body.interestCategoryIds || body.interestCategoryIds.length < 1) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_INTEREST_CATEGORY_COUNT",
            message: "관심 카테고리는 1개 이상 선택해야 합니다.",
          },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          userId: 1,
          email: body.email.trim().toLowerCase(),
          name: body.name,
          nickname: body.nickname,
        },
        error: null,
      },
      { status: 201 },
    );
  }),
];
