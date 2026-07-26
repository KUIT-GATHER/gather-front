import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import mapIcon from "@/assets/icons/Map.svg";
import { CategoryPuzzle } from "@/features/category/components/CategoryPuzzle";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { createRegionIndex } from "@/features/region/lib/createRegionIndex";
import {
  getFullRegionSelectionLabel,
  getRegionSelectionLabel,
  getShortRegionLabel,
} from "@/features/region/lib/regionLabel";
import { REGION_LEVEL } from "@/features/region/types/region.types";
import type { MeetingStatus } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";
import IconButton from "@/shared/ui/IconButton";

export type TeamFilter = {
  regionId?: number;
  category?: PostingCategory;
  status?: MeetingStatus;
};

type FilterView = "main" | "region";

type TeamFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: TeamFilter;
  onApply: (filter: TeamFilter) => void;
};

const statusOptions = [
  { value: "RECRUITING", label: "모집 중" },
  { value: "CLOSED", label: "모집 마감" },
  { value: "COMPLETED", label: "활동 완료" },
] as const satisfies ReadonlyArray<{
  value: MeetingStatus;
  label: string;
}>;

const categoryLabelPositionClasses: Partial<Record<PostingCategory, string>> = {
  COMMUNITY: "-translate-x-1 translate-y-1",
  CULTURE: "-translate-x-1 -translate-y-1",
};

export function TeamFilterSheet({
  open,
  onOpenChange,
  filter,
  onApply,
}: TeamFilterSheetProps) {
  const [view, setView] = useState<FilterView>("main");
  const [draft, setDraft] = useState<TeamFilter>(filter);
  const [activeLevel1RegionId, setActiveLevel1RegionId] = useState<number>();
  const [regionSelectionId, setRegionSelectionId] = useState<number>();
  const shouldLoadRegions = view === "region" || draft.regionId !== undefined;
  const regionsQuery = useRegionsQuery(shouldLoadRegions);
  const regionIndex = useMemo(
    () => createRegionIndex(regionsQuery.data ?? []),
    [regionsQuery.data],
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
    if (!nextOpen) setView("main");
    onOpenChange(nextOpen);
  };

  const openRegionView = () => {
    setRegionSelectionId(draft.regionId);
    setActiveLevel1RegionId(undefined);
    setView("region");
  };

  const applyRegionSelection = () => {
    if (!regionSelectionId) return;
    setDraft((current) => ({ ...current, regionId: regionSelectionId }));
    setView("main");
  };

  const footer =
    view === "region" ? (
      <div className="space-y-3">
        {selectedRegion ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-md">
            <span className="grid size-8 place-items-center rounded-full bg-button/12 text-icon">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-text-gray-300">선택한 지역</p>
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
      <div>
        <Button
          fullWidth
          className="active:bg-icon"
          onClick={() => {
            onApply(draft);
            onOpenChange(false);
          }}
        >
          설정하기
        </Button>
      </div>
    );

  return (
    <BottomSheet
      open={open}
      onOpenChange={closeSheet}
      title={view === "region" ? "지역" : "필터"}
      onBack={view === "region" ? () => setView("main") : undefined}
      footer={footer}
      className={view === "region" ? "max-h-[min(88dvh,48rem)]" : undefined}
      contentClassName={view === "region" ? "px-0 py-0" : undefined}
    >
      {view === "main" ? (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-body-15-semibold text-text">지역</h2>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-stroke bg-white px-4 text-sm text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
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
            <h2 className="text-body-15-semibold text-text">모임 상태</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const selected = draft.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      selected
                        ? "border-button bg-button/10 text-button"
                        : "border-stroke bg-white text-text-gray-400",
                    )}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        status:
                          current.status === option.value
                            ? undefined
                            : option.value,
                      }))
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-body-15-semibold text-text">주제</h2>
            <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-4">
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
                            "max-w-[78px] break-keep text-center text-[13px] font-medium leading-4 text-text",
                            categoryLabelPositionClasses[category],
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
                        "flex w-full rounded-lg px-3 py-3 text-left text-sm text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
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
                      "w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
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
                      "mt-1 w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      regionSelectionId === region.id &&
                        "bg-icon/10 font-medium text-text",
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
