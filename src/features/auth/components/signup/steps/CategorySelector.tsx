import { useFormContext, useWatch } from "react-hook-form";

import { getSignupCategoryIcon } from "@/features/auth/constants/signupCategoryIcons";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import type { SignupCategory } from "@/features/auth/types/auth.types";
import { cn } from "@/shared/lib/cn";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

import { getSignupFieldErrorId } from "@/features/auth/lib/signupFieldA11y";

type CategorySelectorProps = {
  categories: SignupCategory[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function CategorySelector({
  categories,
  isLoading,
  isError,
  onRetry,
}: CategorySelectorProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const selectedIds = useWatch({ control, name: "interestCategoryIds" });

  if (isLoading) {
    return <LoadingState label="카테고리를 불러오는 중입니다." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="카테고리를 불러오지 못했습니다."
        primaryAction={{ label: "다시 시도", onClick: onRetry }}
      />
    );
  }

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        관심 카테고리
      </h2>
      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        1개 이상 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
        {categories.map((category) => {
          const selected = selectedIds.includes(category.id);

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={selected}
              className={cn(
                "relative flex min-h-28 flex-col items-center justify-center rounded-xl p-1 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                selected && "bg-[#DCECDF]/70 ring-2 ring-button/60",
              )}
              onClick={() => {
                const nextIds = selected
                  ? selectedIds.filter((id) => id !== category.id)
                  : [...selectedIds, category.id];

                setValue("interestCategoryIds", nextIds, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <img
                src={getSignupCategoryIcon(category.code)}
                alt=""
                className="h-20 w-20"
              />
              <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-[13px] font-medium leading-4 text-text">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {errors.interestCategoryIds?.message ? (
        <p
          id={getSignupFieldErrorId("interestCategoryIds")}
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.interestCategoryIds.message}
        </p>
      ) : null}
    </section>
  );
}
