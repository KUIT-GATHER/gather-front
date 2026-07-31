import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teamKeys } from "@/features/team/api/team.queries";
import {
  uploadMeetingImages,
  type UploadMeetingImagesParams,
} from "@/features/team/lib/meetingImageUpload";

export function useUploadMeetingImagesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...teamKeys.all, "images", "upload"] as const,
    mutationFn: (params: UploadMeetingImagesParams) =>
      uploadMeetingImages(params),
    retry: false,
    onSuccess: (_data, { meetingId }) => {
      void queryClient.invalidateQueries({
        queryKey: teamKeys.images(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.detail(meetingId),
      });
      void queryClient.invalidateQueries({
        queryKey: teamKeys.home(meetingId),
      });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: teamKeys.my() });
    },
  });
}
