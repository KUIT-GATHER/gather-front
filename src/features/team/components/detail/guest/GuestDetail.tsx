import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestHeader } from "./GuestHeader";
import { GuestJoinBar } from "./GuestJoinBar";
import { GuestTabs } from "./GuestTabs";

type GuestDetailProps = {
  home: MeetingHome;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
  children: ReactNode;
};

function isJoinDisabled(home: MeetingHome) {
  return (
    home.status !== "RECRUITING" || home.currentMemberCount >= home.maxMember
  );
}

export function GuestDetail({
  home,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
  children,
}: GuestDetailProps) {
  const navigate = useNavigate();

  return (
    <article className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
      <GuestHeader
        title={home.name}
        onBack={() => navigate(-1)}
        isBookmarked={isBookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={onBookmarkToggle}
      />
      <GuestTabs meetingId={home.meetingId} />

      {children}

      <GuestJoinBar
        disabled={isJoinDisabled(home)}
        meetingId={home.meetingId}
        meetingName={home.name}
      />
    </article>
  );
}
