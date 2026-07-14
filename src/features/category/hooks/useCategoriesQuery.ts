import { useQuery } from "@tanstack/react-query";

import { categoryQueries } from "../api/category.queries";

export function useCategoriesQuery() {
  return useQuery(categoryQueries.list());
}
