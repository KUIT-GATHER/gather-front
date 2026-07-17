import { useState } from "react";
import { MapPin } from "lucide-react";

import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import { POSTING_CATEGORIES } from "@/features/category/types/postingCategory.types";
import { useRegionGroupsQuery } from "@/features/region/hooks/useRegionGroupsQuery";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import type { VolunteerPostingFilter } from "@/features/volunteer/types/volunteerPostingFilter.types";
import Button from "@/shared/ui/Button";
import BottomSheet from "@/shared/ui/BottomSheet";
import FormField from "@/shared/ui/FormField";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";

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
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);
  const regionsQuery = useRegionsQuery();
  const regionGroupsQuery = useRegionGroupsQuery();
  const dateError = getDateError(draft);

  const regions = regionsQuery.data ?? [];
  const regionGroups = regionGroupsQuery.data ?? [];
  const selectedRegionName = draft.regionId
    ? regions.find((region) => region.id === draft.regionId)?.name
    : draft.regionGroupId
      ? regionGroups.find((group) => group.id === draft.regionGroupId)?.name
      : undefined;

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
      footer={
        <Button fullWidth onClick={handleApply}>
          설정하기
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-body-15-semibold text-text">지역</h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              aria-expanded={isRegionPickerOpen}
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-stroke bg-white px-4 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
              onClick={() => setIsRegionPickerOpen((current) => !current)}
            >
              {selectedRegionName ?? "지역 선택"}
            </button>
            <IconButton
              label="지역 선택 열기"
              icon={<MapPin />}
              variant="surface"
              onClick={() => setIsRegionPickerOpen((current) => !current)}
            />
          </div>
          {isRegionPickerOpen ? (
            <div className="mt-3 rounded-xl border border-stroke bg-white p-3">
              <p className="text-sm font-medium text-text-gray-300">권역</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {regionGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={draft.regionGroupId === group.id}
                    className="rounded-full border border-stroke px-3 py-1.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 aria-pressed:border-button aria-pressed:text-icon"
                    onClick={() => {
                      setDraft((current) => ({
                        ...current,
                        regionId: undefined,
                        regionGroupId: group.id,
                      }));
                      setIsRegionPickerOpen(false);
                    }}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-text-gray-300">
                세부 지역
              </p>
              <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={draft.regionId === region.id}
                    className="rounded-full border border-stroke px-3 py-1.5 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 aria-pressed:border-button aria-pressed:text-icon"
                    onClick={() => {
                      setDraft((current) => ({
                        ...current,
                        regionId: region.id,
                        regionGroupId: undefined,
                      }));
                      setIsRegionPickerOpen(false);
                    }}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
              {selectedRegionName ? (
                <button
                  type="button"
                  className="mt-3 text-sm text-text-gray-300 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
          ) : null}
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
          <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3">
            {POSTING_CATEGORIES.map((category) => {
              const selected = draft.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  className="relative flex min-h-24 items-center justify-center rounded-xl p-1 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      category:
                        current.category === category ? undefined : category,
                    }))
                  }
                >
                  <span className="relative block size-18">
                    <CategoryPuzzle
                      category={category}
                      selected={selected}
                      className="size-full"
                    />
                    <span className="pointer-events-none absolute inset-0 grid place-items-center px-2">
                      <span className="max-w-16 break-keep text-center text-sm font-medium leading-4 text-text">
                        {POSTING_CATEGORY_LABEL[category]}
                      </span>
                    </span>
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
