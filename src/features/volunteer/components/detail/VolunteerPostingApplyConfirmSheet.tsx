import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerDate,
  formatVolunteerLocation,
  getRecruitmentDDay,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";

import { VolunteerPostingBottomSheet } from "./VolunteerPostingBottomSheet";

type VolunteerPostingApplyConfirmSheetProps = {
  open: boolean;
  posting: VolunteerPosting;
  isPending?: boolean;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function VolunteerPostingApplyConfirmSheet({
  open,
  posting,
  isPending = false,
  errorMessage,
  onOpenChange,
  onConfirm,
}: VolunteerPostingApplyConfirmSheetProps) {
  const imageSrc = getVolunteerPostingImage(posting.category, posting.id);
  const location = formatVolunteerLocation(posting);
  const activityDate = formatVolunteerDate(posting.actStartDate);
  const deadline = getRecruitmentDDay(posting.noticeEndDate);
  const metaItems = [location, activityDate].filter(Boolean);

  return (
    <VolunteerPostingBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="신청 확인"
      secondaryAction={{
        label: "취소",
        onClick: () => onOpenChange(false),
        disabled: isPending,
        variant: "primaryOutline",
        className: "border-transparent bg-point-green/25 text-text",
      }}
      primaryAction={{
        label: "신청",
        pendingLabel: "신청 중",
        onClick: onConfirm,
        isPending,
      }}
    >
      <div className="rounded-xl border border-[#C5C5C5] bg-white p-3">
        <div className="flex items-stretch gap-3">
          <img
            src={imageSrc}
            alt=""
            className="w-20 shrink-0 rounded-lg object-cover"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate text-[18px] leading-5 font-semibold text-text">
              {posting.title}
            </h3>
            {posting.content ? (
              <p className="mt-1 truncate text-[15px] text-text-gray-400">
                {posting.content}
              </p>
            ) : null}
            {metaItems.length > 0 || deadline ? (
              <p className="mt-1 truncate text-[15px] text-text-gray-400">
                {metaItems.join(" · ")}
                {deadline ? (
                  <>
                    {metaItems.length > 0 ? <span> · </span> : null}
                    <span className="font-semibold text-point-red">
                      {deadline}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
            <div className="mt-auto pt-3">
              <CategoryBadge category={posting.category} />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[13px] leading-[21.125px] font-normal text-text-gray-400">
        신청 후 외부 링크로 이동하거나 현장 참여가 필요할 수 있어요.
        <br />
        활동 조건을 다시 한번 확인해 주세요.
      </p>

      {errorMessage ? (
        <p role="alert" className="mt-3 text-body-14 text-point-red">
          {errorMessage}
        </p>
      ) : null}
    </VolunteerPostingBottomSheet>
  );
}
