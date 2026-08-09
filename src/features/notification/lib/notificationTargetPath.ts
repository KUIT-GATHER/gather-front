import type { Notification } from "@/features/notification/types/notification.types";

function isValidTargetId(targetId: number | null) {
  return (
    typeof targetId === "number" && Number.isInteger(targetId) && targetId > 0
  );
}

export function getNotificationTargetPath(notification: Notification) {
  switch (notification.targetType) {
    case "POSTING":
      return isValidTargetId(notification.targetId)
        ? `/volunteers/${notification.targetId}`
        : null;
    case "MEETING":
      return isValidTargetId(notification.targetId)
        ? `/teams/${notification.targetId}`
        : null;
    case "MY_PAGE":
      return notification.type === "BADGE_EARNED" ? "/my/badges" : "/my";
    case "POST":
      return isValidTargetId(notification.targetMeetingId) &&
        isValidTargetId(notification.targetId)
        ? `/teams/${notification.targetMeetingId}/posts/${notification.targetId}`
        : null;
    default:
      return null;
  }
}
