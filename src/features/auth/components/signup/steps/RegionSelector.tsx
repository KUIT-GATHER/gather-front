import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import locationIcon from "@/shared/assets/icons/info/location.svg";
import {
  getSignupFieldDescribedBy,
  getSignupFieldErrorId,
} from "@/features/auth/lib/signupFieldA11y";
import type { SignupCommonFormValues } from "@/features/auth/schemas/signupCommon.schema";
import { RegionSelectionSheet } from "@/features/region/components/RegionSelectionSheet";
import { useRegionsQuery } from "@/features/region/hooks/useRegionsQuery";
import { getFullRegionSelectionLabel } from "@/features/region/lib/regionLabel";

export function RegionSelector() {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<SignupCommonFormValues>();

  const activityRegionId = useWatch({
    control,
    name: "activityRegionId",
  });

  const [isRegionSheetOpen, setIsRegionSheetOpen] = useState(false);
  const regionsQuery = useRegionsQuery();
  const regionById = useMemo(
    () =>
      new Map((regionsQuery.data ?? []).map((region) => [region.id, region])),
    [regionsQuery.data],
  );
  const selectedRegion =
    activityRegionId === null ? undefined : regionById.get(activityRegionId);
  const selectedRegionParent = selectedRegion?.parentId
    ? regionById.get(selectedRegion.parentId)
    : undefined;
  const hasActivityRegionError = Boolean(errors.activityRegionId);

  const handleApply = (nextRegionId: number) => {
    setValue("activityRegionId", nextRegionId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    clearErrors("activityRegionId");
  };

  return (
    <section>
      <h2 className="text-[15px] font-semibold leading-5 text-text">
        활동 지역 <span className="text-point-red">*</span>
      </h2>

      <p className="mt-1.5 text-xs font-medium text-text-gray-100">
        활동 공고 및 팀 필터에 기본 적용돼요
      </p>

      <button
        id="activityRegionId"
        type="button"
        aria-describedby={getSignupFieldDescribedBy(
          "activityRegionId",
          hasActivityRegionError,
        )}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-[15px] font-medium text-text focus:border-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        onClick={() => setIsRegionSheetOpen(true)}
      >
        <img src={locationIcon} alt="" aria-hidden="true" className="size-5" />
        {selectedRegion
          ? getFullRegionSelectionLabel(selectedRegion, selectedRegionParent)
          : "활동 지역을 선택해 주세요"}
      </button>

      {errors.activityRegionId?.message ? (
        <p
          id={getSignupFieldErrorId("activityRegionId")}
          role="alert"
          className="mt-1.5 text-xs text-point-red"
        >
          {errors.activityRegionId.message}
        </p>
      ) : null}

      <RegionSelectionSheet
        open={isRegionSheetOpen}
        onOpenChange={setIsRegionSheetOpen}
        title="활동 지역"
        value={activityRegionId ?? undefined}
        onApply={handleApply}
      />
    </section>
  );
}
