import type { PostingListItem } from "@/features/volunteer/types/volunteer.types";

export function getPostingListItemKey(item: PostingListItem) {
  return `${item.sourceType}:${item.meetingId ?? "none"}:${item.id}`;
}

export function getPostingListItemPath(item: PostingListItem) {
  return item.sourceType === "MEETING_RECRUIT"
    ? `/volunteers/meeting-recruits/${item.meetingId}/${item.id}`
    : `/volunteers/${item.id}`;
}
