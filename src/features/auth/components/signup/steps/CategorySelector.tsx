import { useFormContext, useWatch } from "react-hook-form";

import type { SignupCommonFormValues } from "@/features/auth/schemas/signupCommon.schema";
import { CategoryPuzzleGrid } from "@/features/category/components/CategoryPuzzleGrid";

import { getSignupFieldErrorId } from "@/features/auth/lib/signupFieldA11y";

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

      <CategoryPuzzleGrid
        className="mt-5"
        selectedCategories={selectedCategories}
        onToggle={(category) => {
          const selected = selectedCategories.includes(category);
          const nextCategories = selected
            ? selectedCategories.filter((value) => value !== category)
            : [...selectedCategories, category];

          setValue("interestCategories", nextCategories, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />

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
