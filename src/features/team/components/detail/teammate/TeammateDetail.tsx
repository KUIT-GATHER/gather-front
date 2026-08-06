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

  const pathname = location.pathname;
  const teamBasePath = `/teams/${home.meetingId}`;
  const settingsBasePath = `${teamBasePath}/settings`;
  const isSettingsRootPage = pathname === settingsBasePath;
  const isSettingsSubPage = pathname.startsWith(`${settingsBasePath}/`);
  const isSettingsPage = isSettingsRootPage || isSettingsSubPage;

  const showTeamHeader = !isSettingsSubPage;
  const showTabs = !isPostDetailPage && !isSettingsPage;

  return (
    <article
      className={
        isPostDetailPage
          ? "min-h-dvh pb-8"
          : "min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]"
      }
    >
      {showTeamHeader ? (
        <TeammateHeader
          title={home.name}
          viewerRole={viewerRole}
          action={headerAction}
          showSettingsInsteadOfRole={isHomePage && viewerRole === "leader"}
          onBack={() => navigate(-1)}
          onSettingsClick={() => {
            navigate(`${teamBasePath}/settings`);
          }}
          isBookmarked={isBookmarked}
          isBookmarkPending={isBookmarkPending}
          onBookmarkToggle={onBookmarkToggle}
        />
      ) : null}

      {showTabs ? <TeammateTabs meetingId={home.meetingId} /> : null}

      {children}

      {isPostDetailPage ? null : <MobileBottomNavigation />}
    </article>
  );
}
