import { useState } from "react";

import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { useRegionGroupsQuery } from "@/features/region/hooks/useRegionGroupsQuery";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";
import Button from "@/shared/ui/Button";
import BottomSheet from "@/shared/ui/BottomSheet";
import FormField from "@/shared/ui/FormField";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";

type VolunteerPostingFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: VolunteerPostingFilter;
  onApply: (filter: VolunteerPostingFilter) => void;
};

function getDateError(filter: VolunteerPostingFilter) {
  if (Boolean(filter.noticeStartDate) !== Boolean(filter.noticeEndDate)) {
    return "모집 시작일과 종료일을 모두 선택해 주세요.";
  }
  if (
    filter.noticeStartDate &&
    filter.noticeEndDate &&
    filter.noticeStartDate > filter.noticeEndDate
  ) {
    return "모집 시작일은 종료일보다 늦을 수 없어요.";
  }
  return undefined;
}

export function VolunteerPostingFilterSheet({
  open,
  onOpenChange,
  filter,
  onApply,
}: VolunteerPostingFilterSheetProps) {
  const [draft, setDraft] = useState<VolunteerPostingFilter>(filter);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const regionsQuery = useRegionsQuery();
  const regionGroupsQuery = useRegionGroupsQuery();
  const dateError = getDateError(draft);

  const regionOptions = (regionsQuery.data ?? []).map((region) => ({
    value: String(region.id),
    label: region.name,
  }));
  const regionGroupOptions = (regionGroupsQuery.data ?? []).map((group) => ({
    value: String(group.id),
    label: `${group.name} 권역`,
  }));

  const handleApply = () => {
    setIsSubmitted(true);
    if (dateError) return;

    onApply(draft);
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="필터"
      description="지역, 모집 기간, 주제로 봉사 공고를 필터링합니다."
      footer={
        <Button fullWidth onClick={handleApply}>
          설정하기
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-body-15-semibold text-text">지역</h2>
          <div className="mt-3 grid gap-2">
            <Select
              ariaLabel="봉사 지역 권역"
              placeholder="권역 선택"
              value={draft.regionGroupId ? String(draft.regionGroupId) : ""}
              options={regionGroupOptions}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  regionId: undefined,
                  regionGroupId: Number(value),
                }))
              }
            />
            <Select
              ariaLabel="봉사 세부 지역"
              placeholder="세부 지역 선택"
              value={draft.regionId ? String(draft.regionId) : ""}
              options={regionOptions}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  regionId: Number(value),
                  regionGroupId: undefined,
                }))
              }
            />
            {draft.regionId || draft.regionGroupId ? (
              <button
                type="button"
                className="w-fit text-sm text-text-gray-300 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    regionId: undefined,
                    regionGroupId: undefined,
                  }))
                }
              >
                지역 선택 해제
              </button>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="text-body-15-semibold text-text">모집 기간</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <FormField
              label="시작일"
              htmlFor="notice-start-date"
              labelClassName="mb-2 text-sm"
            >
              <Input
                id="notice-start-date"
                type="date"
                value={draft.noticeStartDate ?? ""}
                invalid={isSubmitted && Boolean(dateError)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    noticeStartDate: event.target.value || undefined,
                  }))
                }
              />
            </FormField>
            <FormField
              label="종료일"
              htmlFor="notice-end-date"
              labelClassName="mb-2 text-sm"
            >
              <Input
                id="notice-end-date"
                type="date"
                value={draft.noticeEndDate ?? ""}
                invalid={isSubmitted && Boolean(dateError)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    noticeEndDate: event.target.value || undefined,
                  }))
                }
              />
            </FormField>
          </div>
          {isSubmitted && dateError ? (
            <p className="mt-2 text-sm text-point-red">{dateError}</p>
          ) : null}
        </section>

        <section>
          <h2 className="text-body-15-semibold text-text">주제</h2>
          <p className="mt-1 text-sm text-text-gray-300">
            한 가지 주제를 선택할 수 있어요.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3">
            {POSTING_CATEGORIES.map((category) => {
              const selected = draft.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  className="flex flex-col items-center rounded-xl py-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      category:
                        current.category === category ? undefined : category,
                    }))
                  }
                >
                  <CategoryPuzzle
                    category={category}
                    selected={selected}
                    className="size-18"
                  />
                  <span className="mt-1">
                    {POSTING_CATEGORY_LABEL[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </BottomSheet>
  );
}
