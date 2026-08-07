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

  return (
    <NotificationThumbnailImage
      key={thumbnailSrc}
      src={thumbnailSrc}
      isBadge={notification.type === "BADGE_EARNED"}
    />
  );
}

function NotificationThumbnailImage({
  src,
  isBadge,
}: {
  src: string;
  isBadge: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  const image = (
    <img
      src={hasImageError ? notificationThumbnailFallbackImage : src}
      alt=""
      draggable={false}
      className={
        isBadge
          ? "pointer-events-none size-6 shrink-0 select-none object-contain"
          : "pointer-events-none size-12 shrink-0 select-none rounded-full object-cover"
      }
      onError={() => setHasImageError(true)}
    />
  );

  return isBadge ? (
    <span className="pointer-events-none flex size-12 shrink-0 items-center justify-center rounded-full bg-white p-2.5">
      {image}
    </span>
  ) : (
    <span className="pointer-events-none size-12 shrink-0 overflow-hidden rounded-full">
      {image}
    </span>
  );
}
