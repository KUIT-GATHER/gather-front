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
    onSuccess: (bookmark) => {
      queryClient.setQueryData<MeetingDetail>(
        teamKeys.detail(meetingId),
        (meeting) => updateMeetingBookmarkState(meeting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useRemoveMeetingBookmarkMutation(meetingId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.bookmark(meetingId),
    mutationFn: () => removeMeetingBookmark(meetingId),
    onSuccess: (bookmark) => {
      queryClient.setQueryData<MeetingDetail>(
        teamKeys.detail(meetingId),
        (meeting) => updateMeetingBookmarkState(meeting, bookmark),
      );
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}
