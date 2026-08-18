import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMyProfile } from "../api/myProfile.api";
import { myProfileKeys } from "../api/myProfile.queries";
import { myPageKeys } from "../api/myPage.queries";
import type { MyProfile } from "../types/myProfile.types";

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...myProfileKeys.all, "update"] as const,
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      const cachedProfile = queryClient.getQueryData<MyProfile>(
        myProfileKeys.detail(),
      );
      const loginType = profile.loginType ?? cachedProfile?.loginType;

      if (!loginType) {
        void queryClient.invalidateQueries({
          queryKey: myProfileKeys.detail(),
        });
      } else {
        queryClient.setQueryData(myProfileKeys.detail(), {
          ...profile,
          loginType,
        });
      }
      void queryClient.invalidateQueries({ queryKey: myPageKeys.home() });
    },
  });
}
