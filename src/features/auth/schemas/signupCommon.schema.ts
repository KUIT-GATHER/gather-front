import { z } from "zod";

import {
  isAllowedBirthDate,
  normalizeBirthDate,
} from "@/features/auth/lib/signupFormatters";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";

import type { PostingCategory } from "@/features/category/types/postingCategory.types";

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

export const signupCommonSchema = z.object({
  name: createKoreanOrEnglishTextSchema("이름"),

  birthDate: z
    .string()
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(normalizeBirthDate(value)), {
      error: "생년월일은 YYYY. MM. DD 형식으로 입력해 주세요.",
    })
    .refine(isAllowedBirthDate, {
      error: "생년월일은 1900년 1월 1일부터 오늘까지 입력해 주세요.",
    }),

  gender: z
    .union([z.literal("MALE"), z.literal("FEMALE"), z.literal("")])
    .superRefine((value, context) => {
      if (value === "") {
        context.addIssue({
          code: "custom",
          message: "성별을 선택해 주세요.",
        });
      }
    }),

  phoneNumber: signupPhoneNumberSchema,
  nickname: createKoreanOrEnglishTextSchema("닉네임"),
  introduction: z
    .string()
    .max(50, { error: "소개는 최대 50자까지 입력할 수 있습니다." }),
  activityRegionId: z
    .number({ error: "활동 지역을 선택해 주세요." })
    .nullable()
    .superRefine((value, context) => {
      if (value === null) {
        context.addIssue({
          code: "custom",
          message: "활동 지역을 선택해 주세요.",
        });
      }
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
});

export type SignupCommonFormValues = z.infer<typeof signupCommonSchema>;
export type SignupCommonStepField = keyof SignupCommonFormValues;

export const signupCommonDefaultValues: SignupCommonFormValues = {
  name: "",
  birthDate: "",
  gender: "",
  phoneNumber: "",
  nickname: "",
  introduction: "",
  activityRegionId: null,
  interestCategories: [],
  serviceTermsAgreed: false,
  privacyPolicyAgreed: false,
  marketingAgreed: false,
};

export const basicInfoFields = [
  "name",
  "birthDate",
  "gender",
  "phoneNumber",
] as const satisfies readonly SignupCommonStepField[];

export const profileFields = [
  "nickname",
  "introduction",
  "activityRegionId",
  "interestCategories",
] as const satisfies readonly SignupCommonStepField[];

export const termsFields = [
  "serviceTermsAgreed",
  "privacyPolicyAgreed",
  "marketingAgreed",
] as const satisfies readonly SignupCommonStepField[];
