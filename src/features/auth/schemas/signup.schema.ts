import { z } from "zod";

import {
  isRealPastOrTodayBirthDate,
  normalizeBirthDate,
} from "@/features/auth/lib/signupFormatters";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";

import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type SignupFormValues = {
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "";
  phoneNumber: string;
  email: string;
  emailVerificationCode: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  introduction: string;
  activityRegionId: number | null;
  interestCategories: PostingCategory[];
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingAgreed: boolean;
};

export const signupDefaultValues: SignupFormValues = {
  name: "",
  birthDate: "",
  gender: "",
  phoneNumber: "",
  email: "",
  emailVerificationCode: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
  introduction: "",
  activityRegionId: null,
  interestCategories: [],
  serviceTermsAgreed: false,
  privacyPolicyAgreed: false,
  marketingAgreed: false,
};

const koreanOnlyRegex = /^[가-힣]+$/;
const englishOnlyRegex = /^[A-Za-z]+$/;

function createKoreanOrEnglishTextSchema(label: "이름" | "닉네임") {
  return z.string().superRefine((value, context) => {
    if (value.length === 0) {
      context.addIssue({
        code: "custom",
        message: `${label}을 입력해 주세요.`,
      });
      return;
    }

    if (koreanOnlyRegex.test(value)) {
      if (value.length < 2 || value.length > 10) {
        context.addIssue({
          code: "custom",
          message: `${label}은 한글 2~10자로 입력해 주세요.`,
        });
      }
      return;
    }

    if (englishOnlyRegex.test(value)) {
      if (value.length < 2 || value.length > 20) {
        context.addIssue({
          code: "custom",
          message: `${label}은 영문 2~20자로 입력해 주세요.`,
        });
      }
      return;
    }

    context.addIssue({
      code: "custom",
      message: `${label}은 공백 없이 한글 2~10자 또는 영문 2~20자로 입력해 주세요.`,
    });
  });
}

function hasUniqueCategories(values: PostingCategory[]) {
  return new Set(values).size === values.length;
}

export const signupPhoneNumberSchema = z.string().regex(/^\d{10,11}$/, {
  error: "전화번호는 10~11자리 숫자로 입력해 주세요.",
});

export const signupEmailSchema = z
  .string()
  .trim()
  .min(1, { error: "이메일을 입력해 주세요." })
  .max(255, { error: "이메일은 최대 255자까지 입력할 수 있습니다." })
  .pipe(z.email({ error: "올바른 이메일 형식이 아닙니다." }));

export const signupSchema = z
  .object({
    name: createKoreanOrEnglishTextSchema("이름"),

    birthDate: z
      .string()
      .refine(
        (value) => /^\d{4}-\d{2}-\d{2}$/.test(normalizeBirthDate(value)),
        { error: "생년월일은 YYYY. MM. DD 형식으로 입력해 주세요." },
      )
      .refine(isRealPastOrTodayBirthDate, {
        error: "실제 존재하는 과거 또는 오늘 날짜를 입력해 주세요.",
      }),

    gender: z
      .union([z.literal("MALE"), z.literal("FEMALE"), z.literal("")])
      .refine((value) => value !== "", {
        error: "성별을 선택해 주세요.",
      }),

    phoneNumber: signupPhoneNumberSchema,

    email: signupEmailSchema,

    emailVerificationCode: z
      .string()
      .regex(/^\d{6}$/, { error: "인증번호 6자리를 입력해 주세요." }),

    password: z
      .string()
      .min(6, { error: "비밀번호는 6자 이상이어야 합니다." })
      .max(12, { error: "비밀번호는 12자 이하이어야 합니다." }),

    passwordConfirm: z
      .string()
      .min(6, { error: "비밀번호 확인은 6자 이상이어야 합니다." })
      .max(12, { error: "비밀번호 확인은 12자 이하이어야 합니다." }),

    nickname: createKoreanOrEnglishTextSchema("닉네임"),

    introduction: z
      .string()
      .max(50, { error: "소개는 최대 50자까지 입력할 수 있습니다." }),

    activityRegionId: z
      .number({ error: "활동 지역을 선택해 주세요." })
      .nullable()
      .refine((value) => value !== null, {
        error: "활동 지역을 선택해 주세요.",
      }),

    interestCategories: z
      .array(z.enum(POSTING_CATEGORIES))
      .min(1, { error: "관심 카테고리를 1개 이상 선택해 주세요." })
      .refine(hasUniqueCategories, {
        error: "관심 카테고리는 중복 선택할 수 없습니다.",
      }),

    serviceTermsAgreed: z.boolean().refine((value) => value, {
      error: "서비스 이용약관에 동의해 주세요.",
    }),

    privacyPolicyAgreed: z.boolean().refine((value) => value, {
      error: "개인정보 수집 및 이용에 동의해 주세요.",
    }),

    marketingAgreed: z.boolean(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export type SignupStepField = keyof SignupFormValues;

export const basicInfoFields = [
  "name",
  "birthDate",
  "gender",
  "phoneNumber",
] satisfies SignupStepField[];

export const accountInfoFields = [
  "email",
  "emailVerificationCode",
  "password",
  "passwordConfirm",
] satisfies SignupStepField[];

export const profileFields = [
  "nickname",
  "introduction",
  "activityRegionId",
  "interestCategories",
] satisfies SignupStepField[];

export const termsFields = [
  "serviceTermsAgreed",
  "privacyPolicyAgreed",
  "marketingAgreed",
] satisfies SignupStepField[];
