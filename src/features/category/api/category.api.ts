import { fetchClient } from "@/shared/api/fetchClient";

import type { Category } from "../types/category.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

export function getCategories() {
  return fetchClient<Category[]>("/api/v1/categories", publicOptions);
}
