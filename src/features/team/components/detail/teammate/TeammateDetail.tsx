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

  const pathname = location.pathname;
  const teamBasePath = `/teams/${home.meetingId}`;
  const settingsBasePath = `${teamBasePath}/settings`;
  const activityBasePath = `${teamBasePath}/activity`;

  const isHomePage = pathname === teamBasePath;
  const isBoardPage = pathname === `${teamBasePath}/posts`;
  const isPostDetailPage = pathname.startsWith(`${teamBasePath}/posts/`);

  const isActivityMainPage = pathname === activityBasePath;

  const activitySectionTitleByPath = new Map<string, string>([
    [`${activityBasePath}/recruits`, "내가 신청한 봉사"],
    [`${activityBasePath}/posts`, "작성한 게시글"],
    [`${activityBasePath}/comments`, "댓글 단 게시글"],
  ]);

  const activitySectionTitle = activitySectionTitleByPath.get(pathname);
  const isActivitySubPage = activitySectionTitle !== undefined;

  const isSettingsRootPage = pathname === settingsBasePath;
  const isSettingsSubPage = pathname.startsWith(`${settingsBasePath}/`);
  const isSettingsPage = isSettingsRootPage || isSettingsSubPage;

  const headerAction =
    (isBoardPage || isActivityMainPage) && viewerRole === "leader"
      ? "settings"
      : isHomePage
        ? "bookmark"
        : "none";

  const headerTitle = activitySectionTitle ?? home.name;

  const isPostCreatePage =
    pathname === `${teamBasePath}/posts/new` ||
    pathname.startsWith(`${teamBasePath}/posts/new/`) ||
    pathname === `${teamBasePath}/posts/recruits/new`;

  const isPostEditPage =
    pathname.startsWith(`${teamBasePath}/posts/`) && pathname.endsWith("/edit");

  const isPostWritePage = isPostCreatePage || isPostEditPage;

  const showTeamHeader = !isSettingsSubPage && !isPostWritePage;

  const showTabs = !isPostDetailPage && !isSettingsPage && !isActivitySubPage;

  const handleBack = () => {
    if (isActivitySubPage) {
      navigate(activityBasePath, { replace: true });
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
      {showTeamHeader ? (
        <TeammateHeader
          title={headerTitle}
          viewerRole={viewerRole}
          action={headerAction}
          showSettingsInsteadOfRole={isHomePage && viewerRole === "leader"}
          onBack={handleBack}
          onSettingsClick={() => {
            navigate(settingsBasePath);
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
