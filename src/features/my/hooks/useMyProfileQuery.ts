import { useQuery } from "@tanstack/react-query";

import { myProfileQueries } from "../api/myProfile.queries";

export function useMyProfileQuery() {
  return useQuery(myProfileQueries.detail());
}

export function useMyProfileImageQuery() {
  return useQuery(myProfileQueries.image());
}
