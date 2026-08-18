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

import { TeamPage } from "@/pages/teams/TeamPage";

import { MyPage } from "@/pages/my/MyPage";

import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { RootRouteErrorBoundary } from "@/pages/errors/RootRouteErrorBoundary";

import { RequireAuth } from "@/features/auth/guards/RequireAuth";
import { RequireGuest } from "@/features/auth/guards/RequireGuest";

const devRoutes = import.meta.env.DEV
  ? [
      {
        path: "/dev/components",
        lazy: {
          Component: async () =>
            (await import("@/pages/dev/ComponentTestPage")).ComponentTestPage,
        },
      },
    ]
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
              {
                path: "/account-recovery",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/auth/AccountRecoveryPage"))
                      .AccountRecoveryPage,
                },
              },
              {
                path: "/account-recovery/password",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/auth/PasswordResetPage"))
                      .PasswordResetPage,
                },
              },
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
          {
            path: "/volunteers/search",
            lazy: {
              Component: async () =>
                (await import("@/pages/volunteers/VolunteerSearchPage"))
                  .VolunteerSearchPage,
            },
          },
          {
            path: "/volunteers/meeting-recruits/:meetingId/:postId",
            lazy: {
              Component: async () =>
                (await import("@/pages/volunteers/MeetingRecruitDetailPage"))
                  .MeetingRecruitDetailPage,
            },
          },
          {
            path: "/volunteers/:volunteerId",
            lazy: {
              Component: async () =>
                (await import("@/pages/volunteers/VolunteerDetailPage"))
                  .VolunteerDetailPage,
            },
          },
          {
            path: "/teams/search",
            lazy: {
              Component: async () =>
                (await import("@/pages/teams/TeamSearchPage")).TeamSearchPage,
            },
          },
          {
            path: "/teams/:teamId",
            lazy: {
              Component: async () =>
                (await import("@/pages/teams/TeamDetailPage")).TeamDetailPage,
            },
            children: [
              {
                index: true,
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamDetailHomePage"))
                      .TeamDetailHomePage,
                },
              },
              {
                path: "posts",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamDetailPostListPage"))
                      .TeamDetailPostListPage,
                },
              },
              {
                element: <RequireAuth />,
                children: [
                  {
                    path: "posts/new",
                    lazy: {
                      Component: async () =>
                        (await import("@/pages/teams/TeamPostTypeSelectPage"))
                          .TeamPostTypeSelectPage,
                    },
                  },
                  {
                    path: "posts/new/:postType",
                    lazy: {
                      Component: async () =>
                        (await import("@/pages/teams/TeamPostEditorPage"))
                          .TeamPostEditorPage,
                    },
                  },
                  {
                    path: "posts/:postId/edit",
                    lazy: {
                      Component: async () =>
                        (await import("@/pages/teams/TeamPostEditorPage"))
                          .TeamPostEditorPage,
                    },
                  },
                  {
                    path: "posts/recruits/new",
                    lazy: {
                      Component: async () =>
                        (await import("@/pages/teams/TeamRecruitEditorPage"))
                          .TeamRecruitEditorPage,
                    },
                  },
                  {
                    path: "posts/:postId/recruit/edit",
                    lazy: {
                      Component: async () =>
                        (await import("@/pages/teams/TeamRecruitEditorPage"))
                          .TeamRecruitEditorPage,
                    },
                  },
                ],
              },
              {
                path: "posts/:postId",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamPostDetailPage"))
                      .TeamPostDetailPage,
                },
              },
              {
                path: "activity",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamDetailActivityPage"))
                      .TeamDetailActivityPage,
                },
              },
              {
                path: "activity/recruits",
                lazy: {
                  Component: async () =>
                    (
                      await import("@/pages/teams/TeamDetailActivityRecruitsPage")
                    ).TeamDetailActivityRecruitsPage,
                },
              },
              {
                path: "activity/posts",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamDetailActivityPostsPage"))
                      .TeamDetailActivityPostsPage,
                },
              },
              {
                path: "activity/comments",
                lazy: {
                  Component: async () =>
                    (
                      await import("@/pages/teams/TeamDetailActivityCommentsPage")
                    ).TeamDetailActivityCommentsPage,
                },
              },
              {
                path: "settings",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamSettingsPage"))
                      .TeamSettingsPage,
                },
              },
              {
                path: "settings/info",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamInfoEditPage"))
                      .TeamInfoEditPage,
                },
              },
              {
                path: "settings/members",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamMemberManagementPage"))
                      .TeamMemberManagementPage,
                },
              },
              {
                path: "settings/applications",
                lazy: {
                  Component: async () =>
                    (
                      await import("@/pages/teams/TeamJoinRequestManagementPage")
                    ).TeamJoinRequestManagementPage,
                },
              },
              {
                path: "settings/activities",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamActivityManagementPage"))
                      .TeamActivityManagementPage,
                },
              },
              {
                path: "settings/activities/:postId/applicants",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamActivityApplicantsPage"))
                      .TeamActivityApplicantsPage,
                },
              },
            ],
          },

          // 보호
          {
            element: <RequireAuth />,
            children: [
              {
                path: "/volunteers/:volunteerId/teams/new",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamCreatePage"))
                      .TeamCreatePage,
                },
              },
              {
                path: "/teams/new",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamCreatePage"))
                      .TeamCreatePage,
                },
              },
              {
                path: "/teams/new/complete",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/teams/TeamCreateCompletePage"))
                      .TeamCreateCompletePage,
                },
              },
              {
                path: "/notifications",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/notifications/NotificationPage"))
                      .NotificationPage,
                },
              },
              {
                path: "/my/profile/edit",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/my/ProfileEditPage"))
                      .ProfileEditPage,
                },
              },
              {
                path: "/my/profile/password",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/my/PasswordChangePage"))
                      .PasswordChangePage,
                },
              },
              {
                path: "/my/activities",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/my/MyActivitiesPage"))
                      .MyActivitiesPage,
                },
              },
              {
                path: "/my/badges",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/my/MyBadgesPage")).MyBadgesPage,
                },
              },
              {
                path: "/my/bookmarks",
                lazy: {
                  Component: async () =>
                    (await import("@/pages/my/MyBookmarksPage"))
                      .MyBookmarksPage,
                },
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
