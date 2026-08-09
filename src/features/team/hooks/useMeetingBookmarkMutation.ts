import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addMeetingBookmark,
  removeMeetingBookmark,
} from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";

import type {
  MeetingBookmarkResponse,
  MeetingDetail,
} from "@/features/team/types/team.types";

function updateMeetingBookmarkState(
  meeting: MeetingDetail | undefined,
  bookmark: MeetingBookmarkResponse,
) {
  if (!meeting || meeting.meetingId !== bookmark.meetingId) {
    return meeting;
  }

  return {
    ...meeting,
    bookmarked: bookmark.bookmarked,
  };
}

export function useAddMeetingBookmarkMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.bookmark(meetingId),
    mutationFn: () => addMeetingBookmark(meetingId),
    meta: {
      toast: {
        success: "북마크에 저장했어요",
        error: "북마크에 저장하지 못했어요. 다시 시도해 주세요.",
        id: "bookmark-toast",
      },
    },
    onSuccess: (bookmark) => {
      queryClient.setQueryData<MeetingDetail>(
        teamKeys.detailForViewer(meetingId, true),
        (meeting) => updateMeetingBookmarkState(meeting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.bookmarkedLists(),
      });
    },
  });
}

export function useRemoveMeetingBookmarkMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.bookmark(meetingId),
    mutationFn: () => removeMeetingBookmark(meetingId),
    meta: {
      toast: {
        success: "북마크를 해제했어요",
        error: "북마크를 해제하지 못했어요. 다시 시도해 주세요.",
        id: "bookmark-toast",
      },
    },
    onSuccess: (bookmark) => {
      queryClient.setQueryData<MeetingDetail>(
        teamKeys.detailForViewer(meetingId, true),
        (meeting) => updateMeetingBookmarkState(meeting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.bookmarkedLists(),
      });
    },
  });
}
