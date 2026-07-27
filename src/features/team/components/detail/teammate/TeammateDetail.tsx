import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import type {
  MeetingHome,
  TeammateViewerRole,
} from "@/features/team/types/team.types";

import { TeammateHeader } from "./TeammateHeader";
import { TeammateTabs } from "./TeammateTabs";

type TeammateDetailProps = {
  home: MeetingHome;
  viewerRole: TeammateViewerRole;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
  children: ReactNode;
};

export function TeammateDetail({
  home,
  viewerRole,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
  children,
}: TeammateDetailProps) {
  const navigate = useNavigate();

  return (
    <article className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <TeammateHeader
        title={home.name}
        viewerRole={viewerRole}
        onBack={() => navigate(-1)}
        isBookmarked={isBookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={onBookmarkToggle}
      />
      <TeammateTabs meetingId={home.meetingId} />

      {children}

      <MobileBottomNavigation />
    </article>
  );
}
