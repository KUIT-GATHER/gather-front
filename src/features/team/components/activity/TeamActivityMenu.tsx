import { Link } from "react-router";

import appliedVolunteerIcon from "@/assets/icons/Applied-volunteer.svg";
import arrowIcon from "@/assets/icons/Arrow.svg";
import commentedBoardIcon from "@/assets/icons/Commented-board.svg";
import meetingOutIcon from "@/assets/icons/Meetingout.svg";
import writtenBoardIcon from "@/assets/icons/Written-board.svg";
import { cn } from "@/shared/lib/cn";

type TeamActivityMenuProps = {
  meetingId: number;
  isHost: boolean;
  isLoading: boolean;
  isError: boolean;
  appliedRecruitCount?: number;
  writtenPostCount?: number;
  commentedPostCount?: number;
  onLeaveClick: () => void;
};

type TeamActivityMenuItem = {
  title: string;
  countLabel?: string;
  to?: string;
  iconSrc: string;
  iconClassName?: string;
  onClick?: () => void;
};

export function TeamActivityMenu({
  meetingId,
  isHost,
  isLoading,
  isError,
  appliedRecruitCount,
  writtenPostCount,
  commentedPostCount,
  onLeaveClick,
}: TeamActivityMenuProps) {
  const getCountLabel = (count: number | undefined) => {
    if (isLoading) return "불러오는 중";
    if (isError) return "확인 필요";

    return `총 ${count ?? 0}개`;
  };

  const menuItems: TeamActivityMenuItem[] = [
    {
      title: "내가 신청한 봉사",
      countLabel: getCountLabel(appliedRecruitCount),
      to: `/teams/${meetingId}/activity/recruits`,
      iconSrc: appliedVolunteerIcon,
    },
    {
      title: "작성한 게시글",
      countLabel: getCountLabel(writtenPostCount),
      to: `/teams/${meetingId}/activity/posts`,
      iconSrc: writtenBoardIcon,
      iconClassName: "size-11",
    },
    {
      title: "댓글 단 게시글",
      countLabel: getCountLabel(commentedPostCount),
      to: `/teams/${meetingId}/activity/comments`,
      iconSrc: commentedBoardIcon,
    },
    ...(isHost
      ? []
      : [
          {
            title: "모임 나가기",
            iconSrc: meetingOutIcon,
            iconClassName: "size-11",
            onClick: onLeaveClick,
          },
        ]),
  ];

  return (
    <ul className="space-y-2.5">
      {menuItems.map((item) => (
        <li key={item.title}>
          <TeamActivityMenuCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function TeamActivityMenuCard({ item }: { item: TeamActivityMenuItem }) {
  const content = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center">
        <img
          src={item.iconSrc}
          alt=""
          aria-hidden
          className={cn("size-6 object-contain", item.iconClassName)}
        />
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[18px] leading-5 font-medium text-text">
          {item.title}
        </span>

        {item.countLabel ? (
          <span className="mt-2 block text-[15px] leading-4 font-medium text-text-gray-100">
            {item.countLabel}
          </span>
        ) : null}
      </span>

      <img
        src={arrowIcon}
        alt=""
        aria-hidden
        className="size-11 shrink-0 object-contain"
      />
    </>
  );

  const className = cn(
    "flex h-19.5 w-full items-center gap-3 rounded-xl border px-5 py-4",
    "border-stroke bg-white transition",
    "hover:border-point-green hover:bg-[#f0f6f0]",
    "active:border-point-green active:bg-[#f0f6f0]",
    "focus:outline-none focus-visible:border-point-green focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-point-green/30",
  );

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={item.onClick}>
      {content}
    </button>
  );
}
