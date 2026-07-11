import type { SignupStepField } from "@/features/auth/schemas/signup.schema";
import {
  accountInfoFields,
  basicInfoFields,
  profileFields,
  termsFields,
} from "@/features/auth/schemas/signup.schema";

export const SIGNUP_STEP_ORDER = [
  "basic",
  "account",
  "profile",
  "terms",
] as const;

export type SignupStep = (typeof SIGNUP_STEP_ORDER)[number];

export const SIGNUP_STEP_FIELDS: Record<
  SignupStep,
  readonly SignupStepField[]
> = {
  basic: basicInfoFields,
  account: accountInfoFields,
  profile: profileFields,
  terms: termsFields,
};
