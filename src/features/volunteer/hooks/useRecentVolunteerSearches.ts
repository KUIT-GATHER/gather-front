import { useCallback, useState } from "react";

import { VOLUNTEER_POSTING_SEARCH_RECENT_KEY } from "../constants/volunteerPostingSearch.constants";

const MAX_RECENT_SEARCHES = 6;

function readRecentSearches() {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(VOLUNTEER_POSTING_SEARCH_RECENT_KEY) ?? "[]",
    );
    return Array.isArray(value)
      ? value
          .filter(
            (item): item is string =>
              typeof item === "string" && Boolean(item.trim()),
          )
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

function persistRecentSearches(searches: string[]) {
  window.localStorage.setItem(
    VOLUNTEER_POSTING_SEARCH_RECENT_KEY,
    JSON.stringify(searches),
  );
}

export function useRecentVolunteerSearches() {
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);

  const addRecentSearch = useCallback((keyword: string) => {
    const normalized = keyword.trim();
    if (!normalized) return;

    setRecentSearches((current) => {
      const next = [
        normalized,
        ...current.filter((item) => item !== normalized),
      ].slice(0, MAX_RECENT_SEARCHES);
      persistRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(VOLUNTEER_POSTING_SEARCH_RECENT_KEY);
    }
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
