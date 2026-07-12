import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { getSignupFieldErrorId } from "@/features/auth/lib/signupFieldA11y";
import type { SignupFormValues } from "@/features/auth/schemas/signup.schema";
import { findLevel1RegionId, getChildRegions, getLevel1Regions } from "@/features/region/lib/region.utils";
import type { Region } from "@/features/region/types/region.types";
import { cn } from "@/shared/lib/cn";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

type RegionSelectorProps = {
  regions: Region[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function RegionSelector({
  regions,
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

  /**
   * 사용자가 상위 지역만 선택하고 아직 세부 지역을 선택하지 않은 상태를
   * 화면에 유지하기 위한 UI 전용 상태입니다.
   */
  const [
    manuallySelectedLevel1RegionId,
    setManuallySelectedLevel1RegionId,
  ] = useState<number | null>(null);

  const level1Regions = useMemo(
    () => getLevel1Regions(regions),
    [regions],
  );

  /**
   * 이미 세부 지역이 폼에 저장되어 있다면 해당 지역의 parentId를 통해
   * 선택된 상위 지역을 계산합니다.
   *
   * activityRegionId가 상위 지역 ID인 데이터 구조까지 함께 대응합니다.
   */
  const level1RegionIdFromForm = useMemo(
    () => findLevel1RegionId(regions, activityRegionId),
    [activityRegionId, regions],
  );

  /**
   * 세부 지역이 선택된 상태에서는 폼 값을 기준으로 상위 지역을 결정합니다.
   * 세부 지역이 아직 없다면 사용자가 직접 누른 상위 지역을 사용합니다.
   */
  const selectedLevel1RegionId =
    activityRegionId !== null
      ? level1RegionIdFromForm
      : manuallySelectedLevel1RegionId;

  const level2Regions = useMemo(
    () => getChildRegions(regions, selectedLevel1RegionId),
    [regions, selectedLevel1RegionId],
  );

  const handleLevel1RegionSelect = (regionId: number) => {
    setManuallySelectedLevel1RegionId(regionId);

    /**
     * 상위 지역을 변경하면 기존 세부 지역 선택은 유효하지 않으므로
     * 폼 값을 초기화합니다.
     *
     * 상위 지역을 선택한 직후 필수 오류를 보여주지 않기 위해
     * shouldValidate는 false로 설정합니다.
     */
    setValue("activityRegionId", null, {
      shouldDirty: true,
      shouldValidate: false,
    });

    clearErrors("activityRegionId");
  };

  const handleLevel2RegionSelect = (region: Region) => {
    /**
     * 세부 지역을 직접 선택했으므로 해당 상위 지역도 함께 유지합니다.
     */
    if (region.parentId !== null) {
      setManuallySelectedLevel1RegionId(region.parentId);
    }

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
        상위 지역 선택 후 세부 지역을 1개 선택해 주세요
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {level1Regions.map((region) => {
          const selected = selectedLevel1RegionId === region.id;

          return (
            <button
              key={region.id}
              type="button"
              aria-pressed={selected}
              className={cn(
                "h-12 rounded-xl border text-[15px] font-medium text-text-gray-400 transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                selected
                  ? "border-button bg-[#DCECDF]"
                  : "border-stroke bg-white",
              )}
              onClick={() => handleLevel1RegionSelect(region.id)}
            >
              {region.name}
            </button>
          );
        })}
      </div>

      {selectedLevel1RegionId !== null ? (
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
