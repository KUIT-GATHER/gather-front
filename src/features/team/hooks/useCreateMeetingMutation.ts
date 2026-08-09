import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myPageKeys } from "@/features/my/api/myPage.queries";
import { createMeeting } from "@/features/team/api/team.api";
import { teamKeys } from "@/features/team/api/team.queries";
import { volunteerPostingKeys } from "@/features/volunteer/api/volunteer.queries";
import type { VolunteerPostingMeetingPage } from "@/features/volunteer/types/volunteer.types";

export function useCreateMeetingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: teamKeys.create(),
    mutationFn: createMeeting,
    onSuccess: async (meeting, request) => {
      if (request.volunteerPostingId != null) {
        queryClient.setQueriesData<VolunteerPostingMeetingPage>(
          {
            queryKey: [
              ...volunteerPostingKeys.detail(request.volunteerPostingId),
              "meetings",
            ],
          },
          (page) => {
            if (
              !page ||
              page.content.some((item) => item.meetingId === meeting.meetingId)
            ) {
              return page;
            }

            const totalElements = page.totalElements + 1;
            return {
              ...page,
              content: [
                {
                  meetingId: meeting.meetingId,
                  name: meeting.name,
                  categories: meeting.categories,
                  currentMemberCount: meeting.currentMemberCount,
                  maxMember: meeting.maxMember,
                  regionId: meeting.regionId,
                  regionName: meeting.regionName,
                  status: meeting.status,
                  member: true,
                  host: true,
                },
                ...page.content,
              ].slice(0, page.size),
              totalElements,
              totalPages: Math.ceil(totalElements / page.size),
            };
          },
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: teamKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: teamKeys.my() }),
        request.volunteerPostingId == null
          ? Promise.resolve()
          : queryClient.invalidateQueries({
              queryKey: volunteerPostingKeys.detail(request.volunteerPostingId),
            }),
        queryClient.invalidateQueries({ queryKey: myPageKeys.badges() }),
        queryClient.invalidateQueries({
          queryKey: myPageKeys.activitiesAll(),
        }),
      ]);
    },
  });
}
