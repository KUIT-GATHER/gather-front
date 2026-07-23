import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addVolunteerPostingBookmark,
  removeVolunteerPostingBookmark,
} from "@/features/volunteer/api/volunteer.api";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";

import type {
  VolunteerPosting,
  VolunteerPostingBookmarkResponse,
} from "@/features/volunteer/types/volunteer.types";

function updateVolunteerPostingBookmarkState(
  posting: VolunteerPosting | undefined,
  bookmark: VolunteerPostingBookmarkResponse,
) {
  if (!posting || posting.id !== bookmark.postingId) {
    return posting;
  }

  return {
    ...posting,
    bookmarked: bookmark.bookmarked,
  };
}

export function useAddVolunteerPostingBookmarkMutation(postingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.bookmark(postingId),
    mutationFn: () => addVolunteerPostingBookmark(postingId),
    onSuccess: (bookmark) => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detail(postingId),
        (posting) => updateVolunteerPostingBookmarkState(posting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
    },
  });
}

export function useRemoveVolunteerPostingBookmarkMutation(postingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.bookmark(postingId),
    mutationFn: () => removeVolunteerPostingBookmark(postingId),
    onSuccess: (bookmark) => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detail(postingId),
        (posting) => updateVolunteerPostingBookmarkState(posting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
    },
  });
}
