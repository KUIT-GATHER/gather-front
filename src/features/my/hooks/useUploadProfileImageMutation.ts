import { useMutation, useQueryClient } from "@tanstack/react-query";

import { myProfileKeys } from "../api/myProfile.queries";
import { uploadProfileImage } from "../lib/profileImageUpload";

export function useUploadProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...myProfileKeys.all, "image", "upload"] as const,
    mutationFn: uploadProfileImage,
    retry: false,
    onSuccess: (image) => {
      queryClient.setQueryData(myProfileKeys.image(), image);
    },
  });
}
