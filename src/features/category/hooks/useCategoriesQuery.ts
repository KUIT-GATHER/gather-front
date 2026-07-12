import { useQuery } from "@tanstack/react-query";

import { getCategories } from "../api/category.api";

export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: getCategories,
  });
}
