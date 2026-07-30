import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMyProfile } from "../api/myProfile.api";
import { myProfileKeys } from "../api/myProfile.queries";

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...myProfileKeys.all, "update"] as const,
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(myProfileKeys.detail(), profile);
    },
  });
}
