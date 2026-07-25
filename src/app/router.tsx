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

import { TeamPage } from "@/pages/teams/TeamPage";
import { TeamSearchPage } from "@/pages/teams/TeamSearchPage";
import { TeamCreatePage } from "@/pages/teams/TeamCreatePage";
import { TeamDetailPage } from "@/pages/teams/TeamDetailPage";
import { TeamDetailActivityPage } from "@/pages/teams/TeamDetailActivityPage";
import { TeamDetailHomePage } from "@/pages/teams/TeamDetailHomePage";
import { TeamDetailPostsPage } from "@/pages/teams/TeamDetailPostsPage";

import { NotificationPage } from "@/pages/notifications/NotificationPage";
import { MyPage } from "@/pages/my/MyPage";

import { ComponentTestPage } from "@/pages/dev/ComponentTestPage";

import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { RootRouteErrorBoundary } from "@/pages/errors/RootRouteErrorBoundary";

import { RequireAuth } from "@/features/auth/guards/RequireAuth";

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
          { path: "/onboarding", element: <OnboardingPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/login/email", element: <EmailLoginPage /> },
          {
            path: "/login/kakao/callback",
            element: <KakaoLoginCallbackPage />,
          },
          { path: "/signup", element: <SignupPage /> },
          { path: "/signup/kakao", element: <KakaoSignupPage /> },
          { path: "/terms", element: <TermsPage /> },
        ],
      },

      {
        element: <MainTabLayout />,
        children: [
          { path: "/home", element: <HomePage /> },

          {
            element: <RequireAuth />,
            children: [
              { path: "/teams", element: <TeamPage /> },
              { path: "/teams/:teamId/home", element: <TeamDetailHomePage /> },
              {
                path: "/teams/:teamId/posts",
                element: <TeamDetailPostsPage />,
              },
              {
                path: "/teams/:teamId/activity",
                element: <TeamDetailActivityPage />,
              },
              { path: "/my", element: <MyPage /> },
            ],
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
            path: "/volunteers/:volunteerId",
            element: <VolunteerDetailPage />,
          },
          { path: "/teams/search", element: <TeamSearchPage /> },
          { path: "/teams/:teamId", element: <TeamDetailPage /> },

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
                path: "/notifications",
                element: <NotificationPage />,
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
