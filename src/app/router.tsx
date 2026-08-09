import { createBrowserRouter } from "react-router";

import { RootLayout } from "@/app/layouts/RootLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainTabLayout } from "@/app/layouts/MainTabLayout";
import { PlainLayout } from "@/app/layouts/PlainLayout";

import { EntryPage } from "@/pages/entry/EntryPage";

import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { EmailLoginPage } from "@/pages/auth/EmailLoginPage";
import { KakaoLoginCallbackPage } from "@/pages/auth/KakaoLoginCallbackPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { KakaoSignupPage } from "@/pages/auth/KakaoSignupPage";
import { TermsPage } from "@/pages/auth/TermsPage";

import { HomePage } from "@/pages/home/HomePage";

import { VolunteerListPage } from "@/pages/volunteers/VolunteerListPage";
import { VolunteerSearchPage } from "@/pages/volunteers/VolunteerSearchPage";
import { VolunteerDetailPage } from "@/pages/volunteers/VolunteerDetailPage";
import { MeetingRecruitDetailPage } from "@/pages/volunteers/MeetingRecruitDetailPage";

import { TeamPage } from "@/pages/teams/TeamPage";
import { TeamSearchPage } from "@/pages/teams/TeamSearchPage";
import { TeamCreatePage } from "@/pages/teams/TeamCreatePage";
import { TeamCreateCompletePage } from "@/pages/teams/TeamCreateCompletePage";
import { TeamDetailPage } from "@/pages/teams/TeamDetailPage";
import { TeamDetailActivityPage } from "@/pages/teams/TeamDetailActivityPage";
import { TeamDetailActivityCommentsPage } from "@/pages/teams/TeamDetailActivityCommentsPage";
import { TeamDetailActivityPostsPage } from "@/pages/teams/TeamDetailActivityPostsPage";
import { TeamDetailActivityRecruitsPage } from "@/pages/teams/TeamDetailActivityRecruitsPage";
import { TeamDetailHomePage } from "@/pages/teams/TeamDetailHomePage";
import { TeamPostDetailPage } from "@/pages/teams/TeamPostDetailPage";
import { TeamDetailPostListPage } from "@/pages/teams/TeamDetailPostListPage";
import { TeamSettingsPage } from "@/pages/teams/TeamSettingsPage";
import { TeamInfoEditPage } from "@/pages/teams/TeamInfoEditPage";
import { TeamMemberManagementPage } from "@/pages/teams/TeamMemberManagementPage";
import { TeamJoinRequestManagementPage } from "@/pages/teams/TeamJoinRequestManagementPage";
import { TeamActivityManagementPage } from "@/pages/teams/TeamActivityManagementPage";
import { TeamActivityApplicantsPage } from "@/pages/teams/TeamActivityApplicantsPage";
import { TeamPostTypeSelectPage } from "@/pages/teams/TeamPostTypeSelectPage";
import { TeamPostEditorPage } from "@/pages/teams/TeamPostEditorPage";
import { TeamRecruitEditorPage } from "@/pages/teams/TeamRecruitEditorPage";

import { NotificationPage } from "@/pages/notifications/NotificationPage";
import { MyPage } from "@/pages/my/MyPage";
import { MyActivitiesPage } from "@/pages/my/MyActivitiesPage";
import { MyBadgesPage } from "@/pages/my/MyBadgesPage";
import { MyBookmarksPage } from "@/pages/my/MyBookmarksPage";
import { ProfileEditPage } from "@/pages/my/ProfileEditPage";

import { ComponentTestPage } from "@/pages/dev/ComponentTestPage";

import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { RootRouteErrorBoundary } from "@/pages/errors/RootRouteErrorBoundary";

import { RequireAuth } from "@/features/auth/guards/RequireAuth";
import { RequireGuest } from "@/features/auth/guards/RequireGuest";

import { env } from "@/shared/config/env";

const devRoutes = env.IS_DEV
  ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
  : [];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    ErrorBoundary: RootRouteErrorBoundary,

    children: [
      {
        path: "/",
        element: <EntryPage />,
      },

      {
        element: <AuthLayout />,
        children: [
          {
            element: <RequireGuest />,
            children: [
              { path: "/onboarding", element: <OnboardingPage /> },
              { path: "/login", element: <LoginPage /> },
              { path: "/login/email", element: <EmailLoginPage /> },
              { path: "/signup", element: <SignupPage /> },
            ],
          },
          {
            path: "/login/kakao/callback",
            element: <KakaoLoginCallbackPage />,
          },
          { path: "/signup/kakao", element: <KakaoSignupPage /> },
          { path: "/terms/:type", element: <TermsPage /> },
        ],
      },

      {
        element: <MainTabLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/teams", element: <TeamPage /> },

          {
            element: <RequireAuth />,
            children: [{ path: "/my", element: <MyPage /> }],
          },
        ],
      },

      {
        element: <PlainLayout />,
        children: [
          // 공개
          { path: "/volunteers", element: <VolunteerListPage /> },
          { path: "/volunteers/search", element: <VolunteerSearchPage /> },
          {
            path: "/volunteers/meeting-recruits/:meetingId/:postId",
            element: <MeetingRecruitDetailPage />,
          },
          {
            path: "/volunteers/:volunteerId",
            element: <VolunteerDetailPage />,
          },
          { path: "/teams/search", element: <TeamSearchPage /> },
          {
            path: "/teams/:teamId",
            element: <TeamDetailPage />,
            children: [
              { index: true, element: <TeamDetailHomePage /> },
              { path: "posts", element: <TeamDetailPostListPage /> },
              {
                element: <RequireAuth />,
                children: [
                  { path: "posts/new", element: <TeamPostTypeSelectPage /> },
                  {
                    path: "posts/new/:postType",
                    element: <TeamPostEditorPage />,
                  },
                  {
                    path: "posts/:postId/edit",
                    element: <TeamPostEditorPage />,
                  },
                  {
                    path: "posts/recruits/new",
                    element: <TeamRecruitEditorPage />,
                  },
                  {
                    path: "posts/:postId/recruit/edit",
                    element: <TeamRecruitEditorPage />,
                  },
                ],
              },
              { path: "posts/:postId", element: <TeamPostDetailPage /> },
              { path: "activity", element: <TeamDetailActivityPage /> },
              {
                path: "activity/recruits",
                element: <TeamDetailActivityRecruitsPage />,
              },
              {
                path: "activity/posts",
                element: <TeamDetailActivityPostsPage />,
              },
              {
                path: "activity/comments",
                element: <TeamDetailActivityCommentsPage />,
              },
              { path: "settings", element: <TeamSettingsPage /> },
              { path: "settings/info", element: <TeamInfoEditPage /> },
              {
                path: "settings/members",
                element: <TeamMemberManagementPage />,
              },
              {
                path: "settings/applications",
                element: <TeamJoinRequestManagementPage />,
              },
              {
                path: "settings/activities",
                element: <TeamActivityManagementPage />,
              },
              {
                path: "settings/activities/:postId/applicants",
                element: <TeamActivityApplicantsPage />,
              },
            ],
          },

          // 보호
          {
            element: <RequireAuth />,
            children: [
              {
                path: "/volunteers/:volunteerId/teams/new",
                element: <TeamCreatePage />,
              },
              { path: "/teams/new", element: <TeamCreatePage /> },
              {
                path: "/teams/new/complete",
                element: <TeamCreateCompletePage />,
              },
              {
                path: "/notifications",
                element: <NotificationPage />,
              },
              {
                path: "/my/profile/edit",
                element: <ProfileEditPage />,
              },
              {
                path: "/my/activities",
                element: <MyActivitiesPage />,
              },
              {
                path: "/my/badges",
                element: <MyBadgesPage />,
              },
              {
                path: "/my/bookmarks",
                element: <MyBookmarksPage />,
              },
            ],
          },

          ...devRoutes,
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
