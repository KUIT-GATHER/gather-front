import { useCallback, useState } from "react";

import { TEAM_SEARCH_RECENT_KEY } from "../constants/teamSearch.constants";

const MAX_RECENT_SEARCHES = 6;

function readRecentSearches() {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(TEAM_SEARCH_RECENT_KEY) ?? "[]",
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
  window.localStorage.setItem(TEAM_SEARCH_RECENT_KEY, JSON.stringify(searches));
}

export function useRecentTeamSearches() {
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
      window.localStorage.removeItem(TEAM_SEARCH_RECENT_KEY);
    }
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
