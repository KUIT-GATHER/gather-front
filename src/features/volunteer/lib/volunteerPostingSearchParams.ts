import {
  POSTING_CATEGORIES,
  type PostingCategory,
} from "@/features/category/types/postingCategory.types";

import {
  isVolunteerPostingListSort,
  type VolunteerPostingListSort,
  VOLUNTEER_POSTING_SORT_PARAMS,
} from "../constants/volunteerPostingList.constants";
import type { VolunteerPostingFilter } from "../types/volunteerPostingFilter.types";
import type {
  VolunteerPostingInfiniteParams,
  VolunteerPostingStatus,
} from "../types/volunteer.types";

const VALID_POSTING_STATUSES = new Set<VolunteerPostingStatus>([
  "RECRUITING",
  "CLOSED",
  "COMPLETED",
]);

function parsePositiveInteger(value: string | null) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? value
    : undefined;
}

function parseCategory(value: string | null): PostingCategory | undefined {
  return value && POSTING_CATEGORIES.includes(value as PostingCategory)
    ? (value as PostingCategory)
    : undefined;
}

function parseStatus(value: string | null): VolunteerPostingStatus | undefined {
  return value && VALID_POSTING_STATUSES.has(value as VolunteerPostingStatus)
    ? (value as VolunteerPostingStatus)
    : undefined;
}

export function getVolunteerPostingFilter(
  searchParams: URLSearchParams,
): VolunteerPostingFilter {
  const regionId = parsePositiveInteger(searchParams.get("regionId"));
  const regionGroupId = parsePositiveInteger(searchParams.get("regionGroupId"));
  const noticeStartDate = parseDate(searchParams.get("noticeStartDate"));
  const noticeEndDate = parseDate(searchParams.get("noticeEndDate"));
  const category = parseCategory(searchParams.get("category"));
  const dateFilter =
    noticeStartDate && noticeEndDate && noticeStartDate <= noticeEndDate
      ? { noticeStartDate, noticeEndDate }
      : undefined;
  const categoryFilter = category ? { category } : {};

  if (regionId !== undefined) {
    return dateFilter
      ? { regionId, ...dateFilter, ...categoryFilter }
      : { regionId, ...categoryFilter };
  }

  if (regionGroupId !== undefined) {
    return dateFilter
      ? { regionGroupId, ...dateFilter, ...categoryFilter }
      : { regionGroupId, ...categoryFilter };
  }

  return dateFilter
    ? { ...dateFilter, ...categoryFilter }
    : { ...categoryFilter };
}

export function getVolunteerPostingSort(searchParams: URLSearchParams) {
  const value = searchParams.get("sort");
  return value && isVolunteerPostingListSort(value) ? value : "latest";
}

export function toVolunteerPostingQueryParams(
  searchParams: URLSearchParams,
  sort: VolunteerPostingListSort,
): VolunteerPostingInfiniteParams {
  const filter = getVolunteerPostingFilter(searchParams);
  const keyword = searchParams.get("keyword")?.trim();

  const baseParams = {
    ...(filter.noticeStartDate && filter.noticeEndDate
      ? {
          noticeStartDate: filter.noticeStartDate,
          noticeEndDate: filter.noticeEndDate,
        }
      : {}),
    ...(filter.category ? { category: filter.category } : {}),
    ...(keyword ? { keyword } : {}),
    ...(parseStatus(searchParams.get("status"))
      ? { status: parseStatus(searchParams.get("status")) }
      : {}),
    size: 10,
    sort: VOLUNTEER_POSTING_SORT_PARAMS[sort],
  };

  if (filter.regionId !== undefined) {
    return { ...baseParams, regionId: filter.regionId };
  }

  if (filter.regionGroupId !== undefined) {
    return { ...baseParams, regionGroupId: filter.regionGroupId };
  }

  return baseParams;
}

export function updateVolunteerPostingSearchParams(
  current: URLSearchParams,
  filter: VolunteerPostingFilter,
  options: { keyword?: string; sort?: VolunteerPostingListSort } = {},
) {
  const next = new URLSearchParams(current);

  [
    "regionId",
    "regionGroupId",
    "noticeStartDate",
    "noticeEndDate",
    "category",
  ].forEach((key) => next.delete(key));

  if (filter.regionId !== undefined)
    next.set("regionId", String(filter.regionId));
  if (filter.regionGroupId !== undefined) {
    next.set("regionGroupId", String(filter.regionGroupId));
  }
  if (filter.noticeStartDate && filter.noticeEndDate) {
    next.set("noticeStartDate", filter.noticeStartDate);
    next.set("noticeEndDate", filter.noticeEndDate);
  }
  if (filter.category) next.set("category", filter.category);

  if (options.keyword !== undefined) {
    const keyword = options.keyword.trim();
    if (keyword) next.set("keyword", keyword);
    else next.delete("keyword");
  }
  if (options.sort !== undefined) {
    next.set("sort", options.sort);
  }

  return next;
}
