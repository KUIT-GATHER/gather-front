import { createBrowserRouter } from "react-router";

import { RootLayout } from "@/app/layouts/RootLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { MainTabLayout } from "@/app/layouts/MainTabLayout";
import { PlainLayout } from "@/app/layouts/PlainLayout";

import { EntryPage } from "@/pages/entry/EntryPage";

import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { EmailLoginPage } from "@/pages/auth/EmailLoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { TermsPage } from "@/pages/auth/TermsPage";

import { HomePage } from "@/pages/home/HomePage";

import { VolunteerListPage } from "@/pages/volunteers/VolunteerListPage";
import { VolunteerSearchPage } from "@/pages/volunteers/VolunteerSearchPage";
import { VolunteerDetailPage } from "@/pages/volunteers/VolunteerDetailPage";

import { TeamPage } from "@/pages/teams/TeamPage";
import { TeamSearchPage } from "@/pages/teams/TeamSearchPage";
import { TeamCreatePage } from "@/pages/teams/TeamCreatePage";
import { TeamDetailPage } from "@/pages/teams/TeamDetailPage";

import { NotificationPage } from "@/pages/notifications/NotificationPage";
import { MyPage } from "@/pages/my/MyPage";

import { ComponentTestPage } from "@/pages/dev/ComponentTestPage";

import { env } from "@/shared/config/env";

const devRoutes = env.IS_DEV
  ? [{ path: "/dev/components", element: <ComponentTestPage /> }]
  : [];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
          { path: "/signup", element: <SignupPage /> },
          { path: "/terms", element: <TermsPage /> },
        ],
      },

      {
        element: <MainTabLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/teams", element: <TeamPage /> },
          { path: "/my", element: <MyPage /> },
        ],
      },

      {
        element: <PlainLayout />,
        children: [
          { path: "/volunteers", element: <VolunteerListPage /> },
          { path: "/volunteers/search", element: <VolunteerSearchPage /> },
          { path: "/volunteers/:volunteerId", element: <VolunteerDetailPage /> },

          {
            path: "/volunteers/:volunteerId/teams/new",
            element: <TeamCreatePage />,
          },

          { path: "/teams/search", element: <TeamSearchPage /> },
          { path: "/teams/new", element: <TeamCreatePage /> },
          { path: "/teams/:teamId", element: <TeamDetailPage /> },

          { path: "/notifications", element: <NotificationPage /> },

          ...devRoutes,
        ],
      },
    ],
  },
]);