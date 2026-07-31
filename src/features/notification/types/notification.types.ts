export const NOTIFICATION_CATEGORIES = ["ACTIVITY", "MEETING"] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationTargetType =
  | "POSTING"
  | "MEETING"
  | "POST"
  | "MY_PAGE"
  | (string & {});

export type Notification = {
  id: number;
  category: NotificationCategory;
  type: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: number | null;
  read: boolean;
  createdAt: string;
};

export type NotificationPage = {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

export type NotificationSettings = {
  volunteerScheduleEnabled: boolean;
  bookmarkedPostingDeadlineEnabled: boolean;
  badgeEnabled: boolean;
  activityPostCommentEnabled: boolean;
  meetingJoinResultEnabled: boolean;
  bookmarkedMeetingDeadlineEnabled: boolean;
  meetingPostCommentEnabled: boolean;
};

export type NotificationUnreadCount = {
  activity: number;
  meeting: number;
  total: number;
};
