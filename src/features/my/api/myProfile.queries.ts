import { queryOptions } from "@tanstack/react-query";

import { getMyProfile, getMyProfileImage } from "./myProfile.api";

export const myProfileKeys = {
  all: ["my-profile"] as const,
  detail: () => [...myProfileKeys.all, "detail"] as const,
  image: () => [...myProfileKeys.all, "image"] as const,
};

export const myProfileQueries = {
  detail: () =>
    queryOptions({
      queryKey: myProfileKeys.detail(),
      queryFn: getMyProfile,
    }),
  image: () =>
    queryOptions({
      queryKey: myProfileKeys.image(),
      queryFn: getMyProfileImage,
    }),
};
