import { useMutation } from "@tanstack/react-query";

import {
  addVolunteerPostingBookmark,
  removeVolunteerPostingBookmark,
} from "@/features/volunteer/api/volunteer.api";

export function useVolunteerPostingBookmarkMutation(postingId: number) {
  return useMutation({
    mutationFn: (bookmarked: boolean) =>
      bookmarked
        ? addVolunteerPostingBookmark(postingId)
        : removeVolunteerPostingBookmark(postingId),
  });
}
