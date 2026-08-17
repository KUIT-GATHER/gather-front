import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGatherApiUrl } from "@/mocks/apiScope";
import type { NotificationSettings } from "@/features/notification/types/notification.types";
import { createQueryClient } from "@/shared/query/queryClient";

import { NotificationSettingsSheet } from "./NotificationSettingsSheet";

type NotificationSettingsSheetStoryProps = ComponentProps<
  typeof NotificationSettingsSheet
>;

const settingsEndpoint = getGatherApiUrl("/api/v1/notifications/settings");
const storyAccessToken = "mock-access-token-1-1234567890";

const defaultSettings: NotificationSettings = {
  volunteerScheduleEnabled: true,
  bookmarkedPostingDeadlineEnabled: false,
  badgeEnabled: true,
  activityPostCommentEnabled: false,
  meetingJoinResultEnabled: true,
  bookmarkedMeetingDeadlineEnabled: false,
  meetingPostCommentEnabled: true,
};

function setupStoryAuth() {
  useAuthStore.setState({
    accessToken: storyAccessToken,
    isAuthenticated: true,
    authInitialized: true,
  });

  return () => {
    useAuthStore.setState({
      accessToken: null,
      isAuthenticated: false,
      authInitialized: false,
    });
  };
}

function createSettingsResponse(settings: NotificationSettings) {
  return {
    success: true,
    data: settings,
    error: null,
  };
}

const settingsSuccessHandlers = [
  http.get(settingsEndpoint, () =>
    HttpResponse.json(createSettingsResponse(defaultSettings)),
  ),
  http.put(settingsEndpoint, async ({ request }) => {
    const settings = (await request.json()) as NotificationSettings;

    return HttpResponse.json(createSettingsResponse(settings));
  }),
];

const settingsErrorHandlers = [
  http.get(settingsEndpoint, () =>
    HttpResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "알림 설정을 불러오지 못했어요.",
        },
      },
      { status: 503 },
    ),
  ),
];

function FreshQueryClient({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function ControlledSettingsSheet(args: NotificationSettingsSheetStoryProps) {
  const [open, setOpen] = useState(args.open);

  return (
    <div className="min-h-[240px]">
      {!open ? (
        <button
          type="button"
          className="rounded-full bg-button px-5 py-3 text-white"
          onClick={() => setOpen(true)}
        >
          설정 다시 열기
        </button>
      ) : null}
      <NotificationSettingsSheet
        {...args}
        open={open}
        onOpenChange={(nextOpen) => {
          args.onOpenChange(nextOpen);
          setOpen(nextOpen);
        }}
      />
    </div>
  );
}

const meta = {
  title: "Features/Notification/NotificationSettingsSheet",
  component: NotificationSettingsSheet,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  decorators: [
    (Story) => (
      <FreshQueryClient>
        <Story />
      </FreshQueryClient>
    ),
  ],
  args: {
    open: true,
    onOpenChange: fn(),
  },
  argTypes: {
    onOpenChange: { control: false },
    onBack: { control: false },
  },
  render: (args) => <ControlledSettingsSheet {...args} />,
} satisfies Meta<typeof NotificationSettingsSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Menu: Story = {
  beforeEach({ msw }) {
    const cleanupAuth = setupStoryAuth();
    msw.use(...settingsSuccessHandlers);

    return cleanupAuth;
  },
};

export const ActivityLoaded: Story = {
  args: {
    initialView: "activity",
  },
  beforeEach({ msw }) {
    const cleanupAuth = setupStoryAuth();
    msw.use(...settingsSuccessHandlers);

    return cleanupAuth;
  },
};

export const MeetingLoaded: Story = {
  args: {
    initialView: "meeting",
  },
  beforeEach({ msw }) {
    const cleanupAuth = setupStoryAuth();
    msw.use(...settingsSuccessHandlers);

    return cleanupAuth;
  },
};

export const LoadError: Story = {
  args: {
    initialView: "activity",
  },
  beforeEach({ msw }) {
    const cleanupAuth = setupStoryAuth();
    msw.use(...settingsErrorHandlers);

    return cleanupAuth;
  },
};
