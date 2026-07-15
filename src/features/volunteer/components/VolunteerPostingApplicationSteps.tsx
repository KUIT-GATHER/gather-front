import { Dialog } from "radix-ui";

import ArrowIcon from "@/assets/icons/Arrow.svg";
import ExternalLinkIcon from "@/assets/icons/External-link.svg";
import defaultHeroImage from "@/assets/icons/Temp-volunteer-posting.svg";
import CloseIcon from "@/assets/icons/X.svg";
import type {
  VolunteerPostingApplicationDialogProps,
  VolunteerPostingApplicationLink,
} from "@/features/volunteer/types/volunteerApplication.types";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import IconButton from "@/shared/ui/IconButton";

function formatShortDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date.replaceAll("-", ".");
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(parsedDate)
    .replaceAll(". ", ".")
    .replace(/\.$/, "");
}

function ApplicationDialogCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <Dialog.Close asChild>
      <IconButton
        label="신청 창 닫기"
        icon={<img src={CloseIcon} alt="" />}
        onClick={onClick}
        className="size-8 text-text-gray-400 hover:bg-stroke/60"
      />
    </Dialog.Close>
  );
}

function ApplicationLinkOption({
  link,
  onSelect,
}: {
  link: VolunteerPostingApplicationLink;
  onSelect: (link: VolunteerPostingApplicationLink) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(link)}
      className={cn(
        "flex h-17 w-full items-center gap-3 rounded-lg border border-stroke bg-white px-4 text-left transition",
        "hover:border-button/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center text-icon">
        <img
          src={ExternalLinkIcon}
          alt=""
          className="size-5"
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm leading-5 font-semibold text-text">
        {link.label}
      </span>
      <img
        src={ArrowIcon}
        alt=""
        className="size-5 shrink-0"
        aria-hidden="true"
      />
    </button>
  );
}

export function ApplicationSelectStep({
  links,
  onSelectLink,
}: Pick<VolunteerPostingApplicationDialogProps, "links" | "onSelectLink">) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Dialog.Title className="text-base leading-6 font-semibold text-text">
            신청 경로 선택
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-xs leading-5 font-normal text-text-gray-400">
            이 봉사는 여러 경로로 신청할 수 있어요.
            <br />
            원하는 방법을 선택해 주세요.
          </Dialog.Description>
        </div>
        <ApplicationDialogCloseButton onClick={() => undefined} />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <ApplicationLinkOption
            key={link.id}
            link={link}
            onSelect={onSelectLink}
          />
        ))}
      </div>
    </>
  );
}

function ApplicationPostingSummary({ posting }: { posting: VolunteerPosting }) {
  return (
    <div className="mt-4 rounded-lg border border-stroke bg-white p-2">
      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <img
          src={defaultHeroImage}
          alt=""
          className="aspect-square w-20 rounded-lg object-cover"
        />
        <div className="min-w-0 py-1">
          <p className="truncate text-sm leading-5 font-semibold text-text">
            {posting.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 font-normal text-text-gray-400">
            {posting.content}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-5 items-center rounded-full bg-[#FFF4D9] px-2 text-[11px] font-medium text-[#C58A00]">
              {posting.categoryName}
            </span>
            <span className="text-xs leading-5 font-medium text-point-red">
              {formatShortDate(posting.noticeEndDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicationConfirmStep({
  posting,
  onApply,
  onCancel,
}: Pick<
  VolunteerPostingApplicationDialogProps,
  "posting" | "onApply" | "onCancel"
>) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <Dialog.Title className="pt-1 text-base leading-6 font-semibold text-text">
          신청 확인
        </Dialog.Title>
        <ApplicationDialogCloseButton onClick={onCancel} />
      </div>

      <Dialog.Description className="sr-only">
        선택한 외부 신청 경로로 이동하기 전에 봉사 정보를 확인합니다.
      </Dialog.Description>

      <ApplicationPostingSummary posting={posting} />

      <p className="mt-3 text-xs leading-5 font-normal text-text-gray-400">
        신청 후 외부 링크로 이동하거나 현장 참여가 필요할 수 있어요. 활동 조건을
        다시 한번 확인해 주세요.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Dialog.Close asChild>
          <Button
            onClick={onCancel}
            className="h-12 bg-[#DCECDF] text-base font-semibold text-text"
          >
            취소
          </Button>
        </Dialog.Close>
        <Button
          onClick={onApply}
          className="h-12 text-base font-semibold text-white"
        >
          신청
        </Button>
      </div>
    </>
  );
}
