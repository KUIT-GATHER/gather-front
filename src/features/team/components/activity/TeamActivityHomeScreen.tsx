import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  ClipboardList,
  FileText,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { cn } from "@/shared/lib/cn";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";

type TeamActivityMenuItem = {
  title: string;
  countLabel?: string;
  to?: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
  onClick?: () => void;
};

export function TeamActivityHomeScreen() {
  const { meetingId } = useTeamDetailContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLeaveDialogOpen = searchParams.get("leave") === "open";

  const openLeaveDialog = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("leave", "open");
    setSearchParams(nextSearchParams);
  };

  const closeLeaveDialog = () => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("leave");
    setSearchParams(nextSearchParams, { replace: true });
  };

  const menuItems: TeamActivityMenuItem[] = [
    {
      title: "내가 신청한 봉사",
      countLabel: "총 0개",
      to: `/teams/${meetingId}/activity/recruits`,
      icon: ClipboardList,
    },
    {
      title: "작성한 게시글",
      countLabel: "총 0개",
      to: `/teams/${meetingId}/activity/posts`,
      icon: FileText,
    },
    {
      title: "댓글 단 게시글",
      countLabel: "총 0개",
      to: `/teams/${meetingId}/activity/comments`,
      icon: MessageSquare,
    },
    {
      title: "모임 나가기",
      icon: LogOut,
      tone: "danger",
      onClick: openLeaveDialog,
    },
  ];

  return (
    <section className="px-5.5 py-4">
      <ul className="space-y-2.5">
        {menuItems.map((item) => (
          <li key={item.title}>
            <TeamActivityMenuCard item={item} />
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={isLeaveDialogOpen}
        title="모임을 나갈까요?"
        description="모임 나가기는 아직 연결되지 않았습니다."
        cancelText="취소"
        confirmText="확인"
        onCancel={closeLeaveDialog}
        onConfirm={closeLeaveDialog}
        confirmVariant="danger"
      />
    </section>
  );
}

function TeamActivityMenuCard({ item }: { item: TeamActivityMenuItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          item.tone === "danger" ? "bg-point-red/8" : "bg-button/8",
        )}
      >
        <Icon
          className={cn(
            "h-5.5 w-5.5",
            item.tone === "danger" ? "text-point-red" : "text-button",
          )}
          aria-hidden
        />
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[16px] leading-5 font-semibold text-text">
          {item.title}
        </span>

        {item.countLabel ? (
          <span className="mt-1 block text-[12px] leading-4 font-medium text-text-gray-400">
            {item.countLabel}
          </span>
        ) : null}
      </span>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-text-gray-300"
        aria-hidden
      />
    </>
  );

  const className = cn(
    "flex min-h-15.5 w-full items-center gap-3 rounded-lg border bg-white px-4 py-3",
    "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
    item.tone === "danger"
      ? "border-stroke hover:border-point-red/40"
      : "border-stroke hover:border-button/50 hover:bg-button/5",
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
