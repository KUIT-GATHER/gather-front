import { useQuery } from "@tanstack/react-query";

import {
  getSignupCategories,
  getSignupRegions,
} from "@/features/auth/api/auth.api";

export const signupOptionKeys = {
  regions: ["signup", "regions"] as const,
  categories: ["signup", "categories"] as const,
};

export function useSignupRegionsQuery() {
  return useQuery({
    queryKey: signupOptionKeys.regions,
    queryFn: getSignupRegions,
  });
}

export function useSignupCategoriesQuery() {
  return useQuery({
    queryKey: signupOptionKeys.categories,
    queryFn: getSignupCategories,
  });
}

export function useSignupOptionsQuery() {
  return {
    regionsQuery: useSignupRegionsQuery(),
    categoriesQuery: useSignupCategoriesQuery(),
  };
}
