import { useState } from "react";

import {
  getNotificationThumbnail,
  notificationThumbnailFallbackImage,
} from "@/features/notification/lib/getNotificationThumbnail";

import type { Notification } from "@/features/notification/types/notification.types";

type NotificationThumbnailProps = {
  notification: Notification;
};

export function NotificationThumbnail({
  notification,
}: NotificationThumbnailProps) {
  const thumbnailSrc = getNotificationThumbnail(notification);

  return <NotificationThumbnailImage key={thumbnailSrc} src={thumbnailSrc} />;
}

function NotificationThumbnailImage({ src }: { src: string }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <img
      src={hasImageError ? notificationThumbnailFallbackImage : src}
      alt=""
      className="size-12 shrink-0 rounded-lg object-cover"
      onError={() => setHasImageError(true)}
    />
  );
}
