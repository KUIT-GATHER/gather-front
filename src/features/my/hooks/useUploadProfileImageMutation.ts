import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadProfileImage } from "@/features/profile/lib/profileImageUpload";

import { myProfileKeys } from "../api/myProfile.queries";
import { myPageKeys } from "../api/myPage.queries";

export function useUploadProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...myProfileKeys.all, "image", "upload"] as const,
    mutationFn: uploadProfileImage,
    retry: false,
    onSuccess: (image) => {
      queryClient.setQueryData(myProfileKeys.image(), image);
      void queryClient.invalidateQueries({ queryKey: myPageKeys.home() });
    },
  });
}
