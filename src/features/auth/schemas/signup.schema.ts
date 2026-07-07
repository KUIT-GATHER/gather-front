import { z } from "zod";

const koreanOnlyRegex = /^[가-힣]+$/;

function isPastOrTodayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(date.getTime()) && date <= today;
}

function hasUniqueNumbers(values: number[]) {
  return new Set(values).size === values.length;
}

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "이름을 입력해 주세요.")
      .max(9, "이름은 최대 9자까지 입력할 수 있습니다.")
      .refine((value) => {
        if (koreanOnlyRegex.test(value)) {
          return value.length <= 7;
        }

        return value.length <= 9;
      }, "한글 이름은 최대 7자, 영문/혼합 이름은 최대 9자까지 입력할 수 있습니다."),

    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "생년월일 형식이 올바르지 않습니다.")
      .refine(isPastOrTodayDate, "미래 날짜는 선택할 수 없습니다."),

    gender: z.enum(["MALE", "FEMALE"]),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9]+$/, "전화번호는 숫자만 입력해 주세요."),

    email: z
      .string()
      .trim()
      .email("올바른 이메일 형식이 아닙니다.")
      .max(255, "이메일은 최대 255자까지 입력할 수 있습니다."),

    password: z
      .string()
      .min(6, "비밀번호는 6자 이상이어야 합니다.")
      .max(12, "비밀번호는 12자 이하이어야 합니다."),

    passwordConfirm: z
      .string()
      .min(6, "비밀번호 확인은 6자 이상이어야 합니다.")
      .max(12, "비밀번호 확인은 12자 이하이어야 합니다."),

    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(8, "닉네임은 8자 이하이어야 합니다."),

    introduction: z
      .string()
      .max(50, "소개글은 최대 50자까지 입력할 수 있습니다.")
      .optional(),

    activityRegionIds: z
      .array(z.number())
      .min(1, "활동 지역을 1개 이상 선택해 주세요.")
      .max(3, "활동 지역은 최대 3개까지 선택할 수 있습니다.")
      .refine(hasUniqueNumbers, "활동 지역은 중복 선택할 수 없습니다."),

    interestCategoryIds: z
      .array(z.number())
      .min(1, "관심 카테고리를 1개 이상 선택해 주세요.")
      .refine(hasUniqueNumbers, "관심 카테고리는 중복 선택할 수 없습니다."),

    serviceTermsAgreed: z.literal(true, {
      error: "서비스 이용약관에 동의해 주세요.",
    }),

    privacyPolicyAgreed: z.literal(true, {
      error: "개인정보 처리방침에 동의해 주세요.",
    }),

    marketingAgreed: z.boolean(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
