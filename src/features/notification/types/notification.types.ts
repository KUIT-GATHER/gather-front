export const NOTIFICATION_CATEGORIES = ["ACTIVITY", "MEETING"] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationTargetType =
  | "POSTING"
  | "MEETING"
  | "POST"
  | "MY_PAGE"
  | (string & {});

export type NotificationType =
  | "VOLUNTEER_SCHEDULE"
  | "BOOKMARKED_POSTING_DEADLINE"
  | "BADGE_EARNED"
  | "ACTIVITY_POST_COMMENT"
  | "MEETING_JOIN_APPROVED"
  | "MEETING_JOIN_REJECTED"
  | "MEETING_BOOKMARKED_DEADLINE"
  | "MEETING_POST_COMMENT"
  | "MEETING_NOTICE_CREATED"
  | "MEETING_POSTING_CREATED"
  | "MEETING_POST_CREATED"
  | (string & {});

export type Notification = {
  id: number;
  category: NotificationCategory;
  type: NotificationType;
  message: string;
  targetType: NotificationTargetType;
  targetId: number | null;
  targetMeetingId: number | null;
  thumbnailUrl: string | null;
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
