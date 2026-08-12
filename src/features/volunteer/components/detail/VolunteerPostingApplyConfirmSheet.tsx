import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { getVolunteerPostingImage } from "@/features/volunteer/lib/getVolunteerPostingImage";
import {
  formatVolunteerLocation,
  formatVolunteerShortDate,
  getRecruitmentDDay,
} from "@/features/volunteer/lib/volunteerPostingFormatters";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import Button from "@/shared/ui/Button";

import { VolunteerPostingBottomSheet } from "./VolunteerPostingBottomSheet";

type VolunteerPostingApplyConfirmSheetProps = {
  open: boolean;
  posting: VolunteerPosting;
  errorMessage?: string;
  onOpenChange: (open: boolean) => void;
  onOpenExternalApplication: () => void;
  onRegisterSchedule: () => void;
};

export function VolunteerPostingApplyConfirmSheet({
  open,
  posting,
  errorMessage,
  onOpenChange,
  onOpenExternalApplication,
  onRegisterSchedule,
}: VolunteerPostingApplyConfirmSheetProps) {
  const imageSrc = getVolunteerPostingImage(posting.category, posting.id);
  const location = formatVolunteerLocation(posting);
  const activityDate = formatVolunteerShortDate(posting.actStartDate);
  const deadline = getRecruitmentDDay(posting.noticeEndDate);
  const metaItems = [location, activityDate].filter(Boolean);

  return (
    <VolunteerPostingBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="신청 확인"
      className="rounded-t-[40px] bg-bg"
    >
      <div className="rounded-xl border border-[#C5C5C5] bg-white px-[11px] py-[15px]">
        <div className="flex items-stretch gap-3">
          <img
            src={imageSrc}
            alt=""
            className="h-[106px] w-[91px] shrink-0 rounded-[10px] object-cover"
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

      <div className="mt-2">
        <p className="text-[13px] leading-[21.125px] font-normal text-text-gray-400">
          신청 버튼 클릭 시 외부 신청 링크가 새 탭으로 열립니다.
          <br />
          외부 신청 완료 후 Gather에서 신청 일정을 등록해 주세요.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-5">
          <Button
            type="button"
            fullWidth
            variant="primaryOutline"
            className="border-transparent bg-point-green/25 text-text"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            fullWidth
            disabled={!posting.applicationUrl}
            onClick={onOpenExternalApplication}
          >
            신청
          </Button>
        </div>
        {!posting.applicationUrl ? (
          <p className="mt-2 text-body-14 text-point-red">
            외부 신청 페이지를 열 수 없는 공고예요.
          </p>
        ) : null}
      </div>

      <div className="mt-7 border-t border-stroke pt-5">
        <p className="text-body-14 text-text-gray-400">
          외부 신청을 완료하셨나요?
        </p>
        <Button
          type="button"
          fullWidth
          variant="primaryOutline"
          className="mt-3 h-12 bg-white"
          onClick={onRegisterSchedule}
        >
          신청 일정 등록하기
        </Button>
      </div>

      {errorMessage ? (
        <p role="alert" className="mt-3 text-body-14 text-point-red">
          {errorMessage}
        </p>
      ) : null}
    </VolunteerPostingBottomSheet>
  );
}
