import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { getSignupFieldErrorId } from "@/features/auth/lib/signupFieldA11y";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import {
  findRegionGroupIdBySelectedRegion,
  getLevel2RegionsByGroup,
} from "@/features/region/lib/region.utils";
import type { Region, RegionGroup } from "@/features/region/types/region.types";
import { cn } from "@/shared/lib/cn";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

type RegionSelectorProps = {
  regions: Region[];
  regionGroups: RegionGroup[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function RegionSelector({
  regions,
  regionGroups,
  isLoading,
  isError,
  onRetry,
}: RegionSelectorProps) {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupFormValues>();

  const activityRegionId = useWatch({
    control,
    name: "activityRegionId",
  });

  const [manuallySelectedRegionGroupId, setManuallySelectedRegionGroupId] =
    useState<number | null>(null);

  const regionGroupIdFromForm = useMemo(
    () => findRegionGroupIdBySelectedRegion(regions, activityRegionId),
    [activityRegionId, regions],
  );

  const selectedRegionGroupId =
    manuallySelectedRegionGroupId ?? regionGroupIdFromForm;

  const level2Regions = useMemo(
    () => getLevel2RegionsByGroup(regions, selectedRegionGroupId),
    [regions, selectedRegionGroupId],
  );

  const handleRegionGroupSelect = (regionGroupId: number) => {
    setManuallySelectedRegionGroupId(regionGroupId);

    if (selectedRegionGroupId !== regionGroupId) {
      setValue("activityRegionId", null, {
        shouldDirty: true,
        shouldValidate: false,
      });

      clearErrors("activityRegionId");
    }
  };

  const handleLevel2RegionSelect = (region: Region) => {
    setManuallySelectedRegionGroupId(
      findRegionGroupIdBySelectedRegion(regions, region.id),
    );

    setValue("activityRegionId", region.id, {
      shouldDirty: true,
      shouldValidate: true,
    });

    clearErrors("activityRegionId");
  };

  if (isLoading) {
    return <LoadingState label="지역을 불러오는 중입니다." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="지역을 불러오지 못했습니다."
        primaryAction={{
          label: "다시 시도",
          onClick: onRetry,
        }}
      />
    );
  }

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        활동 지역 <span className="text-point-red">*</span>
      </h2>

      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        권역 선택 후 시군구를 1개 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {regionGroups.map((regionGroup) => {
          const selected = selectedRegionGroupId === regionGroup.id;

          return (
            <button
              key={regionGroup.id}
              type="button"
              aria-pressed={selected}
              className={cn(
                "h-12 rounded-xl border text-[15px] font-medium text-text-gray-400 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                selected
                  ? "border-button bg-[#DCECDF]"
                  : "border-stroke bg-white",
              )}
              onClick={() => handleRegionGroupSelect(regionGroup.id)}
            >
              {regionGroup.name}
            </button>
          );
        })}
      </div>

      {selectedRegionGroupId !== null ? (
        <div className="mt-4 max-h-43 overflow-y-auto rounded-xl border border-stroke bg-white p-3">
          {level2Regions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {level2Regions.map((region) => {
                const selected = activityRegionId === region.id;

                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={selected}
                    className={cn(
                      "min-h-10 rounded-lg border px-3 py-2 text-sm transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                      selected
                        ? "border-button bg-[#DCECDF] text-text"
                        : "border-stroke bg-white text-text-gray-400",
                    )}
                    onClick={() => handleLevel2RegionSelect(region)}
                  >
                    {region.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-3 text-center text-sm text-text-gray-100">
              선택 가능한 세부 지역이 없습니다.
            </p>
          )}
        </div>
      ) : null}

      {errors.activityRegionId?.message ? (
        <p
          id={getSignupFieldErrorId("activityRegionId")}
          role="alert"
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.activityRegionId.message}
        </p>
      ) : null}
    </section>
  );
}
