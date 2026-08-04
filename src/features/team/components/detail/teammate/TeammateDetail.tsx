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
  const headerAction =
    isBoardPage && viewerRole === "leader"
      ? "settings"
      : isHomePage
        ? "bookmark"
        : "none";
  const isSettingsPage = location.pathname.startsWith(
    `/teams/${home.meetingId}/settings`,
  );
  const settingsBasePath = `/teams/${home.meetingId}/settings`;

  const isSettingsRootPage = location.pathname === settingsBasePath;

  const isSettingsSubPage = location.pathname.startsWith(
    `${settingsBasePath}/`,
  );

  return (
    <article
      className={
        isPostDetailPage
          ? "min-h-dvh pb-8"
          : "min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]"
      }
    >
      {isSettingsSubPage ? null : (
        <TeammateHeader
          title={home.name}
          viewerRole={viewerRole}
          action={headerAction}
          showSettingsInsteadOfRole={isHomePage && viewerRole === "leader"}
          onBack={() => navigate(-1)}
          onSettingsClick={() => {
            navigate(`/teams/${home.meetingId}/settings`);
          }}
          isBookmarked={isBookmarked}
          isBookmarkPending={isBookmarkPending}
          onBookmarkToggle={onBookmarkToggle}
        />
      )}

      {isPostDetailPage || isSettingsRootPage || isSettingsSubPage ? null : (
        <TeammateTabs meetingId={home.meetingId} />
      )}

      {children}

      {isPostDetailPage ? null : <MobileBottomNavigation />}
    </article>
  );
}
