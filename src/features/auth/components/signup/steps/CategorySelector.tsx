import { useFormContext, useWatch } from "react-hook-form";

import type { SignupCommonFormValues } from "@/features/auth/schemas/signupCommon.schema";
import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import { cn } from "@/shared/lib/cn";

import { getSignupFieldErrorId } from "@/features/auth/lib/signupFieldA11y";

const labelPositionClasses: Partial<Record<PostingCategory, string>> = {
  COMMUNITY: "-translate-x-1 translate-y-1",
  CULTURE: "-translate-x-1 -translate-y-1",
};

export function CategorySelector() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<SignupCommonFormValues>();
  const selectedCategories = useWatch({ control, name: "interestCategories" });

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        관심 카테고리
      </h2>
      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        1개 이상 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
        {POSTING_CATEGORIES.map((category) => {
          const selected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              className={cn(
                "relative flex min-h-28 items-center justify-center rounded-xl p-1 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
              )}
              onClick={() => {
                const nextCategories = selected
                  ? selectedCategories.filter((value) => value !== category)
                  : [...selectedCategories, category];

                setValue("interestCategories", nextCategories, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <span className="relative block size-[105px]">
                <CategoryPuzzle
                  category={category}
                  selected={selected}
                  className="size-full"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center px-2">
                  <span
                    className={cn(
                      "max-w-[78px] break-keep text-center text-[13px] font-medium leading-4 text-text",
                      labelPositionClasses[category],
                    )}
                  >
                    {POSTING_CATEGORY_LABEL[category]}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {errors.interestCategories?.message ? (
        <p
          id={getSignupFieldErrorId("interestCategories")}
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.interestCategories.message}
        </p>
      ) : null}
    </section>
  );
}
