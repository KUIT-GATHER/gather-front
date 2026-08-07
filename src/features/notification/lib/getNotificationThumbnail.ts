import activityBadgeIcon from "@/features/my/assets/activity-badge.svg";
import meetingFallbackImage from "@/features/team/assets/meeting-images/community/community-01.webp";
import { getVolunteerNotificationImage } from "@/features/volunteer/lib/getVolunteerPostingImage";

import type { Notification } from "@/features/notification/types/notification.types";

export const notificationThumbnailFallbackImage = meetingFallbackImage;

function isValidTargetId(targetId: number | null): targetId is number {
  return (
    typeof targetId === "number" && Number.isInteger(targetId) && targetId > 0
  );
}

export function getNotificationThumbnail(notification: Notification): string {
  if (notification.type === "BADGE_EARNED") {
    return activityBadgeIcon;
  }

  const thumbnailUrl = notification.thumbnailUrl?.trim();

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  if (
    notification.targetType === "POSTING" &&
    isValidTargetId(notification.targetId)
  ) {
    return getVolunteerNotificationImage(notification.targetId);
  }

  return notificationThumbnailFallbackImage;
}
