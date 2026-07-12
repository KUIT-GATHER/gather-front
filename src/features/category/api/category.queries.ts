import { queryOptions } from "@tanstack/react-query";

import { getCategories } from "./category.api";

const CATEGORY_STALE_TIME = 30 * 60 * 1000;
const CATEGORY_GC_TIME = 60 * 60 * 1000;

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
};

export const categoryQueries = {
  list: () =>
    queryOptions({
      queryKey: categoryKeys.list(),
      queryFn: getCategories,
      staleTime: CATEGORY_STALE_TIME,
      gcTime: CATEGORY_GC_TIME,
    }),
};
