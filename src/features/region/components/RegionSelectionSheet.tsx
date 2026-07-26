import { useMemo, useState } from "react";

import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { createRegionIndex } from "@/features/region/lib/createRegionIndex";
import { getShortRegionLabel } from "@/features/region/lib/regionLabel";
import { REGION_LEVEL } from "@/features/region/types/region.types";
import { cn } from "@/shared/lib/cn";
import BottomSheet from "@/shared/ui/BottomSheet";
import Button from "@/shared/ui/Button";

type RegionSelectionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: number;
  onApply: (regionId: number) => void;
  title?: string;
};

export function RegionSelectionSheet({
  open,
  onOpenChange,
  value,
  onApply,
  title = "지역",
}: RegionSelectionSheetProps) {
  const [selectionId, setSelectionId] = useState<number | undefined>(value);
  const [activeLevel1RegionId, setActiveLevel1RegionId] = useState<number>();
  const regionsQuery = useRegionsQuery(open);
  const regionIndex = useMemo(
    () => createRegionIndex(regionsQuery.data ?? []),
    [regionsQuery.data],
  );
  const selectedRegion = selectionId
    ? regionIndex.byId.get(selectionId)
    : undefined;
  const displayedActiveLevel1RegionId =
    activeLevel1RegionId ??
    (selectedRegion?.level === REGION_LEVEL.SIDO
      ? selectedRegion.id
      : selectedRegion?.parentId) ??
    regionIndex.level1Regions[0]?.id;
  const activeLevel1Region = displayedActiveLevel1RegionId
    ? regionIndex.byId.get(displayedActiveLevel1RegionId)
    : undefined;
  const level2Regions = displayedActiveLevel1RegionId
    ? (
        regionIndex.childrenByParentId.get(displayedActiveLevel1RegionId) ?? []
      ).filter((region) => region.level === REGION_LEVEL.SIGUNGU)
    : [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectionId(value);
      setActiveLevel1RegionId(undefined);
    }
    onOpenChange(nextOpen);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      contentClassName="p-0"
      footer={
        <Button
          fullWidth
          disabled={!selectionId}
          className="active:bg-icon"
          onClick={() => {
            if (!selectionId) return;
            onApply(selectionId);
            onOpenChange(false);
          }}
        >
          적용하기
        </Button>
      }
    >
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
                  aria-pressed={selectionId === activeLevel1Region.id}
                  className={cn(
                    "w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                    selectionId === activeLevel1Region.id &&
                      "bg-icon/10 font-medium text-text",
                  )}
                  onClick={() => setSelectionId(activeLevel1Region.id)}
                >
                  {activeLevel1Region.name} 전체
                </button>
              ) : null}
              {level2Regions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  aria-pressed={selectionId === region.id}
                  className={cn(
                    "mt-1 w-full rounded-lg px-4 py-3 text-left text-sm text-text-gray-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                    selectionId === region.id &&
                      "bg-icon/10 font-medium text-text",
                  )}
                  onClick={() => setSelectionId(region.id)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
