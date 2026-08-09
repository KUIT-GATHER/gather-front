import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myPageKeys } from "@/features/my/api/myPage.queries";
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
    meta: {
      toast: {
        success: "북마크에 저장했어요",
        error: "북마크에 저장하지 못했어요. 다시 시도해 주세요.",
        id: "bookmark-toast",
      },
    },
    onSuccess: (bookmark) => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detailForViewer(postingId, "member"),
        (posting) => updateVolunteerPostingBookmarkState(posting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.bookmarkedLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.badges(),
      });
    },
  });
}

export function useRemoveVolunteerPostingBookmarkMutation(postingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: volunteerPostingKeys.bookmark(postingId),
    mutationFn: () => removeVolunteerPostingBookmark(postingId),
    meta: {
      toast: {
        success: "북마크를 해제했어요",
        error: "북마크를 해제하지 못했어요. 다시 시도해 주세요.",
        id: "bookmark-toast",
      },
    },
    onSuccess: (bookmark) => {
      queryClient.setQueryData<VolunteerPosting>(
        volunteerPostingKeys.detailForViewer(postingId, "member"),
        (posting) => updateVolunteerPostingBookmarkState(posting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.detail(postingId),
      });
      void queryClient.invalidateQueries({
        queryKey: volunteerPostingKeys.bookmarkedLists(),
      });
      void queryClient.invalidateQueries({
        queryKey: myPageKeys.badges(),
      });
    },
  });
}
