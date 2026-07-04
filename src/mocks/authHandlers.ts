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

type MockUser = {
  id: number;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  email: string;
  password: string;
  nickname: string;
  introduction?: string;
  activityRegionIds: number[];
  interestCategoryIds: number[];
};

const users: MockUser[] = [
  {
    id: 1,
    name: "동진",
    birthDate: "2000-01-01",
    gender: "MALE",
    phoneNumber: "01012345678",
    email: "test@gather.com",
    password: "123456789",
    nickname: "가더",
    introduction: "함께 봉사하는 걸 좋아해요.",
    activityRegionIds: [1],
    interestCategoryIds: [1, 2],
  },
];

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
        available: !users.some((user) => user.phoneNumber === phoneNumber),
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
        expiresAt: "2026-07-04T12:10:00",
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

    if (
      !body.email ||
      !body.password ||
      !body.passwordConfirm ||
      !body.name ||
      !body.birthDate ||
      !body.gender ||
      !body.phoneNumber ||
      !body.nickname
    ) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "필수 정보를 모두 입력해 주세요.",
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

    const email = body.email.trim().toLowerCase();
    const phoneNumber = body.phoneNumber
      .replaceAll("-", "")
      .replaceAll(" ", "");

    if (users.some((user) => user.email === email)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "이미 가입된 이메일입니다.",
          },
        },
        { status: 409 },
      );
    }

    if (users.some((user) => user.phoneNumber === phoneNumber)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "PHONE_NUMBER_ALREADY_EXISTS",
            message: "이미 가입된 전화번호입니다.",
          },
        },
        { status: 409 },
      );
    }

    const newUser: MockUser = {
      id: users.length + 1,
      name: body.name,
      birthDate: body.birthDate,
      gender: body.gender,
      phoneNumber,
      email,
      password: body.password,
      nickname: body.nickname,
      introduction: body.introduction,
      activityRegionIds: body.activityRegionIds,
      interestCategoryIds: body.interestCategoryIds,
    };

    users.push(newUser);

    return HttpResponse.json(
      {
        success: true,
        data: {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          nickname: newUser.nickname,
        },
        error: null,
      },
      { status: 201 },
    );
  }),

  http.post("*/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "이메일과 비밀번호를 입력해 주세요.",
          },
        },
        { status: 400 },
      );
    }

    const user = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "이메일 또는 비밀번호가 올바르지 않습니다.",
          },
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: `mock-access-token-${user.id}`,
        refreshToken: `mock-refresh-token-${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          activityRegionIds: user.activityRegionIds,
          interestCategoryIds: user.interestCategoryIds,
          profileImageUrl: null,
        },
      },
      error: null,
    });
  }),
];
