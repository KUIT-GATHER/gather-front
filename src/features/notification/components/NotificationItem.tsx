import { formatNotificationCreatedAt } from "@/features/notification/lib/formatNotificationCreatedAt";
import { NotificationThumbnail } from "@/features/notification/components/NotificationThumbnail";

import type { Notification } from "@/features/notification/types/notification.types";
import { cn } from "@/shared/lib/cn";

function getNotificationMessageParts(notification: Notification) {
  if (notification.type === "BADGE_EARNED") {
    const endIndex = notification.message.indexOf(".");

    return endIndex >= 0
      ? [
          notification.message.slice(0, endIndex + 1),
          notification.message.slice(endIndex + 1),
        ]
      : [notification.message, ""];
  }

  const bracketedName = notification.message.match(/^\[([^\]]+)\](.*)$/);

  return bracketedName
    ? [bracketedName[1], bracketedName[2]]
    : ["", notification.message];
}

type NotificationItemProps = {
  notification: Notification;
  onClick: () => void;
  disabled?: boolean;
};

export function NotificationItem({
  notification,
  onClick,
  disabled = false,
}: NotificationItemProps) {
  const readStatus = notification.read ? "읽은 알림" : "읽지 않은 알림";
  const [emphasis, rest] = getNotificationMessageParts(notification);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-[22px] px-[27px] py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-button/40 disabled:cursor-not-allowed",
        notification.read ? "bg-bg" : "bg-[#F0F6F0]",
      )}
      aria-label={`${readStatus}: ${notification.message}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="sr-only">{readStatus}</span>
      <NotificationThumbnail notification={notification} />
      <span className="min-w-0 flex-1">
        <span className="block break-words text-body-15 text-text">
          {emphasis ? (
            <strong className="font-semibold">{emphasis}</strong>
          ) : null}
          {rest}
        </span>
        <time
          dateTime={notification.createdAt}
          className="mt-2 block text-xs leading-5 font-medium text-text-gray-100"
        >
          {formatNotificationCreatedAt(notification.createdAt)}
        </time>
      </span>
    </button>
  );
}
