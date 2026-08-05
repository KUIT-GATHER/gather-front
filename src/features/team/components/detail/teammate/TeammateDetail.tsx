import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

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
  const location = useLocation();
  const navigate = useNavigate();
  const isBoardPage = location.pathname.endsWith("/posts");
  const isPostDetailPage = location.pathname.startsWith(
    `/teams/${home.meetingId}/posts/`,
  );
  const isHomePage = location.pathname === `/teams/${home.meetingId}`;
  const activitySectionTitleByPath = new Map([
    [`/teams/${home.meetingId}/activity/recruits`, "내가 신청한 봉사"],
    [`/teams/${home.meetingId}/activity/posts`, "작성한 게시글"],
    [`/teams/${home.meetingId}/activity/comments`, "댓글 단 게시글"],
  ]);
  const activitySectionTitle = activitySectionTitleByPath.get(
    location.pathname,
  );
  const headerAction =
    isBoardPage && viewerRole === "leader"
      ? "settings"
      : isHomePage
        ? "bookmark"
        : "none";
  const headerTitle = activitySectionTitle ?? home.name;
  const handleBack = () => {
    if (activitySectionTitle) {
      navigate(`/teams/${home.meetingId}/activity`);
      return;
    }

    navigate(-1);
  };

  return (
    <article
      className={
        isPostDetailPage
          ? "min-h-dvh pb-8"
          : "min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]"
      }
    >
      <TeammateHeader
        title={headerTitle}
        viewerRole={viewerRole}
        action={headerAction}
        onBack={handleBack}
        isBookmarked={isBookmarked}
        isBookmarkPending={isBookmarkPending}
        onBookmarkToggle={onBookmarkToggle}
      />
      {isPostDetailPage ? null : <TeammateTabs meetingId={home.meetingId} />}

      {children}

      {isPostDetailPage ? null : <MobileBottomNavigation />}
    </article>
  );
}
