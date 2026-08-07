import { useMemo, useState } from "react";
import type { DateRange } from "@daypicker/react";
import { CalendarDays, MapPin } from "lucide-react";

import mapIcon from "@/assets/icons/Map.svg";
import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import { createRegionIndex } from "@/features/region/lib/createRegionIndex";
import {
  getFullRegionSelectionLabel,
  getRegionSelectionLabel,
  getShortRegionLabel,
} from "@/features/region/lib/regionLabel";
import { REGION_LEVEL } from "@/features/region/types/region.types";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import {
  formatTeamDateForApi,
  formatTeamDateRange,
  getTeamDateFilterFromRange,
  getTeamDateRangeFromValues,
} from "@/features/activity/lib/activityFilterDateRange";

import Button from "@/shared/ui/Button";
import BottomSheet from "@/shared/ui/BottomSheet";
import DateRangeCalendar from "@/shared/ui/DateRangeCalendar";
import IconButton from "@/shared/ui/IconButton";
import { cn } from "@/shared/lib/cn";

type FilterView = "main" | "date" | "region";

type ActivityDateFilter = {
  startDate: string;
  endDate: string;
};

type FilterDraft = {
  regionId?: number;
  dateRange?: ActivityDateFilter;
  category?: PostingCategory;
};

const categoryLabelPositionClasses: Partial<Record<PostingCategory, string>> = {
  COMMUNITY: "-translate-x-1 translate-y-1",
  CULTURE: "-translate-x-1 -translate-y-1",
};

const categoryLabelColorClasses: Record<PostingCategory, string> = {
  ENVIRONMENT: "text-[#17534C]",
  EDUCATION: "text-[#111B55]",
  CULTURE: "text-[#483811]",
  COMMUNITY: "text-[#294C30]",
  WELFARE: "text-[#591C59]",
  OVERSEAS: "text-[#162D45]",
};

export type ActivityFilter = {
  regionId?: number;
  startDate?: string;
  endDate?: string;
  category?: PostingCategory;
};

type ActivityFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: ActivityFilter;
  onApply: (filter: ActivityFilter) => void;
  dateLabel?: string;
};

function createDraft(filter: ActivityFilter): FilterDraft {
  const dateRange = getTeamDateRangeFromValues(
    filter.startDate,
    filter.endDate,
  );
  const dateFilter = getTeamDateFilterFromRange(dateRange);

  return {
    ...(filter.regionId !== undefined ? { regionId: filter.regionId } : {}),
    ...(dateFilter
      ? {
          dateRange: {
            startDate: dateFilter.activityStartDate,
            endDate: dateFilter.activityEndDate,
          },
        }
      : {}),
    ...(filter.category ? { category: filter.category } : {}),
  };
}

function toActivityFilter(draft: FilterDraft): ActivityFilter {
  const categoryFilter = draft.category ? { category: draft.category } : {};
  const dateFilter = draft.dateRange
    ? {
        startDate: draft.dateRange.startDate,
        endDate: draft.dateRange.endDate,
      }
    : {};

  if (draft.regionId !== undefined) {
    return { regionId: draft.regionId, ...dateFilter, ...categoryFilter };
  }

  return { ...dateFilter, ...categoryFilter };
}

export function ActivityFilterSheet({
  open,
  onOpenChange,
  filter,
  onApply,
  dateLabel = "활동 기간",
}: ActivityFilterSheetProps) {
  const [view, setView] = useState<FilterView>("main");
  const [draft, setDraft] = useState<FilterDraft>(() => createDraft(filter));
  const [dateSelection, setDateSelection] = useState<DateRange>();
  const [activeLevel1RegionId, setActiveLevel1RegionId] = useState<number>();
  const [regionSelectionId, setRegionSelectionId] = useState<number>();
  const shouldLoadRegions = view === "region" || draft.regionId !== undefined;
  const regionsQuery = useRegionsQuery(shouldLoadRegions);
  const regions = regionsQuery.data;
  const regionIndex = useMemo(
    () => createRegionIndex(regions ?? []),
    [regions],
  );
  const selectedDraftRegion = draft.regionId
    ? regionIndex.byId.get(draft.regionId)
    : undefined;
  const selectedDraftRegionParent = selectedDraftRegion?.parentId
    ? regionIndex.byId.get(selectedDraftRegion.parentId)
    : undefined;
  const selectedRegion = regionSelectionId
    ? regionIndex.byId.get(regionSelectionId)
    : undefined;
  const selectedRegionParent = selectedRegion?.parentId
    ? regionIndex.byId.get(selectedRegion.parentId)
    : undefined;
  const inferredActiveLevel1RegionId =
    selectedRegion?.level === REGION_LEVEL.SIDO
      ? selectedRegion.id
      : (selectedRegion?.parentId ??
        (selectedDraftRegion?.level === REGION_LEVEL.SIDO
          ? selectedDraftRegion.id
          : selectedDraftRegion?.parentId) ??
        regionIndex.level1Regions[0]?.id);
  const displayedActiveLevel1RegionId =
    activeLevel1RegionId ?? inferredActiveLevel1RegionId;
  const activeLevel1Region = displayedActiveLevel1RegionId
    ? regionIndex.byId.get(displayedActiveLevel1RegionId)
    : undefined;
  const level2Regions = displayedActiveLevel1RegionId
    ? (
        regionIndex.childrenByParentId.get(displayedActiveLevel1RegionId) ?? []
      ).filter((region) => region.level === REGION_LEVEL.SIGUNGU)
    : [];

  const closeSheet = (nextOpen: boolean) => {
    if (!nextOpen) {
      setView("main");
    }
    onOpenChange(nextOpen);
  };

  const openDateView = () => {
    setDateSelection(
      getTeamDateRangeFromValues(
        draft.dateRange?.startDate,
        draft.dateRange?.endDate,
      ),
    );
    setView("date");
  };

  const openRegionView = () => {
    setRegionSelectionId(draft.regionId);
    setActiveLevel1RegionId(undefined);
    setView("region");
  };

  const applyDateSelection = () => {
    const dateRange = getTeamDateFilterFromRange(dateSelection);
    if (!dateRange) return;

    setDraft((current) => ({
      ...current,
      dateRange: {
        startDate: dateRange.activityStartDate,
        endDate: dateRange.activityEndDate,
      },
    }));
    setView("main");
  };

  const applyRegionSelection = () => {
    if (!regionSelectionId) return;

    setDraft((current) => ({ ...current, regionId: regionSelectionId }));
    setView("main");
  };

  const applyFilter = () => {
    onApply(toActivityFilter(draft));
    onOpenChange(false);
  };

  const resetFilter = () => {
    setDraft({});
    setDateSelection(undefined);
    setRegionSelectionId(undefined);
    setActiveLevel1RegionId(undefined);
    onApply({});
    onOpenChange(false);
  };

  const title =
    view === "date" ? dateLabel : view === "region" ? "지역" : "필터";
  const onBack =
    view === "date" || view === "region" ? () => setView("main") : undefined;

  const footer =
    view === "date" ? (
      <Button
        fullWidth
        disabled={!dateSelection?.from || !dateSelection.to}
        className="active:bg-icon"
        onClick={applyDateSelection}
      >
        {dateSelection?.from && dateSelection.to
          ? formatTeamDateRange(
              formatTeamDateForApi(dateSelection.from),
              formatTeamDateForApi(dateSelection.to),
            )
          : "기간을 선택해 주세요"}
      </Button>
    ) : view === "region" ? (
      <div className="space-y-3">
        {selectedRegion ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md">
            <span className="grid size-8 place-items-center rounded-full bg-button/12 text-icon">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-text-gray-300">선택된 지역</p>
              <p className="text-body-14-semibold text-text">
                {getFullRegionSelectionLabel(
                  selectedRegion,
                  selectedRegionParent,
                )}
              </p>
            </div>
          </div>
        ) : null}
        <Button
          fullWidth
          disabled={!selectedRegion}
          className="active:bg-icon"
          onClick={applyRegionSelection}
        >
          적용하기
        </Button>
      </div>
    ) : (
      <div className="mx-auto grid w-full max-w-[315px] grid-cols-2 gap-3">
        <Button
          fullWidth
          variant="primaryOutline"
          className="active:bg-button/8"
          onClick={resetFilter}
        >
          초기화
        </Button>
        <Button fullWidth className="active:bg-icon" onClick={applyFilter}>
          설정하기
        </Button>
      </div>
    );

  return (
    <BottomSheet
      open={open}
      onOpenChange={closeSheet}
      title={title}
      onBack={onBack}
      footer={footer}
      className={cn(
        "rounded-t-[40px] bg-bg",
        view === "main"
          ? "h-[min(673px,90dvh)] max-h-[min(673px,90dvh)]"
          : view === "region"
            ? "max-h-[min(88dvh,48rem)]"
            : undefined,
      )}
      contentClassName={cn(
        view === "region" && "px-0 py-0",
        view === "date" &&
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {view === "main" ? (
        <div className="flex flex-col gap-7">
          <section>
            <h2 className="text-title-18 text-text">지역</h2>
            <div className="mt-3 flex gap-3.5">
              <button
                type="button"
                className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-stroke bg-white px-4 text-sm text-text underline focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={openRegionView}
              >
                {selectedDraftRegion
                  ? getRegionSelectionLabel(
                      selectedDraftRegion,
                      selectedDraftRegionParent,
                    )
                  : "지역 선택"}
              </button>
              <IconButton
                label="지역 선택 열기"
                icon={<img src={mapIcon} alt="" />}
                variant="surface"
                onClick={openRegionView}
              />
            </div>
          </section>

          <section>
            <h2 className="text-title-18 text-text">{dateLabel}</h2>
            <button
              type="button"
              className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-stroke bg-white px-4 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
              onClick={openDateView}
            >
              <CalendarDays className="size-5 text-icon" aria-hidden="true" />
              {draft.dateRange
                ? formatTeamDateRange(
                    draft.dateRange.startDate,
                    draft.dateRange.endDate,
                  )
                : `${dateLabel} 선택`}
            </button>
          </section>

          <section>
            <h2 className="text-title-18 text-text">주제</h2>
            <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-0">
              {POSTING_CATEGORIES.map((category) => {
                const selected = draft.category === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    className="relative flex min-h-28 items-center justify-center rounded-xl p-1 text-sm text-text transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        category:
                          current.category === category ? undefined : category,
                      }))
                    }
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
                            "max-w-[78px] break-keep text-center text-lg font-medium leading-5",
                            categoryLabelPositionClasses[category],
                            categoryLabelColorClasses[category],
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
          </section>
        </div>
      ) : null}

      {view === "date" ? (
        <div className="rounded-3xl border-2 border-button px-3 py-4">
          <DateRangeCalendar
            selected={dateSelection}
            defaultMonth={dateSelection?.from}
            onSelect={setDateSelection}
          />
        </div>
      ) : null}

      {view === "region" ? (
        <div className="min-h-0 border-t border-stroke">
          {regionsQuery.isLoading ? (
            <p className="px-5.5 py-8 text-center text-sm text-text-gray-300">
              지역 정보를 불러오는 중이에요.
            </p>
          ) : null}
          {regionsQuery.isError ? (
            <div className="px-5.5 py-8 text-center">
              <p className="text-sm text-text-gray-300">
                지역 정보를 불러오지 못했어요.
              </p>
              <button
                type="button"
                className="mt-2 text-sm text-icon underline focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                onClick={() => void regionsQuery.refetch()}
              >
                다시 시도
              </button>
            </div>
          ) : null}
          {!regionsQuery.isLoading && !regionsQuery.isError ? (
            <div className="grid h-[min(48dvh,28rem)] grid-cols-[6.5rem_minmax(0,1fr)]">
              <div className="overflow-y-auto bg-button/5 p-1.5">
                {regionIndex.level1Regions.map((region) => {
                  const isActive = region.id === displayedActiveLevel1RegionId;

                  return (
                    <button
                      key={region.id}
                      type="button"
                      aria-pressed={isActive}
                      className={cn(
                        "flex w-full rounded-lg px-3 py-3 text-left text-sm text-text-gray-300",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                        isActive && "bg-icon/10 font-medium text-text",
                      )}
                      onClick={() => setActiveLevel1RegionId(region.id)}
                    >
                      {getShortRegionLabel(region)}
                    </button>
                  );
                })}
              </div>
              <div className="min-w-0 overflow-y-auto p-2">
                {activeLevel1Region ? (
                  <button
                    type="button"
                    aria-pressed={regionSelectionId === activeLevel1Region.id}
                    className={cn(
                      "w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      regionSelectionId === activeLevel1Region.id &&
                        "bg-icon/10 font-medium text-text",
                    )}
                    onClick={() => setRegionSelectionId(activeLevel1Region.id)}
                  >
                    {activeLevel1Region.name} 전체
                  </button>
                ) : null}
                {level2Regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={regionSelectionId === region.id}
                    className={cn(
                      "mt-1 w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      regionSelectionId === region.id &&
                        "bg-[rgba(217,217,217,0.44)] font-medium text-text",
                    )}
                    onClick={() => setRegionSelectionId(region.id)}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </BottomSheet>
  );
}
