import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";
import {
  isTeamListSort,
  TEAM_SORT_PARAMS,
  type TeamListSort,
} from "@/features/team/constants/teamList.constants";
import type { TeamFilter } from "@/features/team/types/teamFilter.types";
import type { MeetingInfiniteParams } from "@/features/team/types/team.types";

function parsePositiveInteger(value: string | null) {
  if (!value) return undefined;

  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function parseCategory(value: string | null): PostingCategory | undefined {
  return value && POSTING_CATEGORIES.includes(value as PostingCategory)
    ? (value as PostingCategory)
    : undefined;
}

export function getTeamListFilter(searchParams: URLSearchParams): TeamFilter {
  return {
    regionId: parsePositiveInteger(searchParams.get("regionId")),
    activityStartDate: searchParams.get("activityStartDate") || undefined,
    activityEndDate: searchParams.get("activityEndDate") || undefined,
    category: parseCategory(searchParams.get("category")),
  };
}

export function getTeamListSort(
  searchParams: URLSearchParams,
): TeamListSort | undefined {
  const value = searchParams.get("sort");
  return isTeamListSort(value) ? value : undefined;
}

export function toTeamListQueryParams(
  searchParams: URLSearchParams,
): MeetingInfiniteParams {
  const filter = getTeamListFilter(searchParams);
  const sort = getTeamListSort(searchParams);
  const keyword = searchParams.get("keyword")?.trim();

  return {
    ...(keyword ? { keyword } : {}),
    ...filter,
    size: 20,
    sort: [...TEAM_SORT_PARAMS[sort ?? "latest"]],
    basedOnPosting: sort === "posting" ? true : undefined,
  };
}

export function updateTeamListSearchParams(
  current: URLSearchParams,
  filter: TeamFilter,
  options: { keyword?: string; sort?: TeamListSort } = {},
) {
  const next = new URLSearchParams(current);

  ["regionId", "activityStartDate", "activityEndDate", "category"].forEach(
    (key) => next.delete(key),
  );

  if (filter.regionId !== undefined) {
    next.set("regionId", String(filter.regionId));
  }
  if (filter.activityStartDate && filter.activityEndDate) {
    next.set("activityStartDate", filter.activityStartDate);
    next.set("activityEndDate", filter.activityEndDate);
  }
  if (filter.category) next.set("category", filter.category);

  if (options.keyword !== undefined) {
    const keyword = options.keyword.trim();
    if (keyword) next.set("keyword", keyword);
    else next.delete("keyword");
  }
  if (options.sort !== undefined) next.set("sort", options.sort);

  return next;
}
