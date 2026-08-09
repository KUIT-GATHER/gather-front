import type { ReactNode } from "react";

import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestDetail } from "./guest/GuestDetail";
import { TeammateDetail } from "./teammate/TeammateDetail";

type TeamDetailScreenProps = {
  home: MeetingHome;
  isJoined: boolean;
  isHost: boolean;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
  children: ReactNode;
};

export function TeamDetailScreen({
  home,
  isJoined,
  isHost,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
  children,
}: TeamDetailScreenProps) {
  if (!isJoined) {
    return (
      <GuestDetail
        home={home}
        isBookmarked={isBookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={onBookmarkToggle}
      >
        {children}
      </GuestDetail>
    );
  }

  return (
    <TeammateDetail
      home={home}
      viewerRole={isHost ? "leader" : "member"}
      isBookmarked={isBookmarked}
      isBookmarkPending={isBookmarkPending}
      onBookmarkToggle={onBookmarkToggle}
    >
      {children}
    </TeammateDetail>
  );
}
