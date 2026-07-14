import { fetchClient } from "@/shared/api/fetchClient";

import type {
  VolunteerPosting,
  VolunteerPostingBookmark,
  VolunteerPostingListParams,
  VolunteerPostingPage,
  VolunteerPostingStatus,
} from "@/features/volunteer/types/volunteer.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

const POSTING_ENDPOINT = "/api/v1/postings";

function setQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined) {
    return;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return;
  }

  const normalizedValue =
    typeof value === "string" ? value.trim() : String(value);

  if (normalizedValue) {
    searchParams.set(key, normalizedValue);
  }
}

function appendQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: string,
) {
  const normalizedValue = value.trim();

  if (normalizedValue) {
    searchParams.append(key, normalizedValue);
  }
}

function buildPostingListQuery(params: VolunteerPostingListParams = {}) {
  if (params.regionId !== undefined && params.regionGroupId !== undefined) {
    throw new Error("regionId and regionGroupId cannot be used together.");
  }

  const searchParams = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  setQueryParam(searchParams, "page", page);
  setQueryParam(searchParams, "size", size);

  params.sort?.forEach((sort) => {
    appendQueryParam(searchParams, "sort", sort);
  });

  setQueryParam(searchParams, "regionId", params.regionId);
  setQueryParam(searchParams, "regionGroupId", params.regionGroupId);
  setQueryParam(searchParams, "status", params.status);
  setQueryParam(searchParams, "noticeStartDate", params.noticeStartDate);
  setQueryParam(searchParams, "noticeEndDate", params.noticeEndDate);
  setQueryParam(searchParams, "keyword", params.keyword);

  return searchParams.toString();
}

function buildPostingListEndpoint(params?: VolunteerPostingListParams) {
  const query = buildPostingListQuery(params);

  return query ? `${POSTING_ENDPOINT}?${query}` : POSTING_ENDPOINT;
}

function buildPostingEndpoint(postingId: number) {
  return `${POSTING_ENDPOINT}/${postingId}`;
}

type VolunteerPostingApiLocation = {
  locationSeq?: number;
  location_seq?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
};

type VolunteerPostingApiItem = Omit<
  Partial<VolunteerPosting>,
  "locations" | "status"
> & {
  status?: VolunteerPostingStatus | "OPEN";
  thumbnail_url?: string;
  sido_name?: string;
  sigungu_name?: string;
  address?: string;
  recruit_org?: string;
  register_org?: string;
  act_start_date?: string;
  act_end_date?: string;
  act_start_time?: string;
  act_end_time?: string;
  notice_start_date?: string;
  notice_end_date?: string;
  act_wkdy?: string;
  recruit_count?: number;
  applicant_count?: number;
  is_adult?: boolean;
  is_teen?: boolean;
  is_group?: boolean;
  manager_name?: string;
  manager_tel?: string;
  manager_fax?: string;
  manager_email?: string;
  manager_address?: string;
  region_id?: number;
  region_name?: string;
  category_id?: number;
  category_name?: string;
  category?: {
    id?: number;
    name?: string;
  };
  region?: {
    id?: number;
    name?: string;
  };
  locations?: VolunteerPostingApiLocation[];
  created_at?: string;
  updated_at?: string;
};

type VolunteerPostingApiPage = Omit<VolunteerPostingPage, "content"> & {
  content: VolunteerPostingApiItem[];
};

function normalizePostingStatus(
  status: VolunteerPostingApiItem["status"] | "OPEN" | undefined,
): VolunteerPostingStatus {
  if (status === "CLOSED" || status === "COMPLETED") {
    return status;
  }

  return "RECRUITING";
}

function normalizePostingLocations(posting: VolunteerPostingApiItem) {
  const locations =
    posting.locations?.map((location, index) => ({
      locationSeq: location.locationSeq ?? location.location_seq ?? index + 1,
      address: location.address ?? "",
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
    })) ?? [];

  if (locations.length > 0 || !posting.address) {
    return locations;
  }

  return [
    {
      locationSeq: 1,
      address: posting.address,
      latitude: 0,
      longitude: 0,
    },
  ];
}

function normalizeVolunteerPosting(
  posting: VolunteerPostingApiItem,
): VolunteerPosting {
  return {
    id: posting.id ?? 0,
    title: posting.title ?? "",
    status: normalizePostingStatus(posting.status),
    content: posting.content ?? "",

    recruitOrg: posting.recruitOrg ?? posting.recruit_org ?? "",
    registerOrg: posting.registerOrg ?? posting.register_org ?? "",

    actStartDate: posting.actStartDate ?? posting.act_start_date ?? "",
    actEndDate: posting.actEndDate ?? posting.act_end_date ?? "",
    actStartTime: posting.actStartTime ?? posting.act_start_time ?? "",
    actEndTime: posting.actEndTime ?? posting.act_end_time ?? "",
    noticeStartDate: posting.noticeStartDate ?? posting.notice_start_date ?? "",
    noticeEndDate: posting.noticeEndDate ?? posting.notice_end_date ?? "",
    actWkdy: posting.actWkdy ?? posting.act_wkdy ?? "",

    recruitCount: posting.recruitCount ?? posting.recruit_count ?? 0,
    applicantCount: posting.applicantCount ?? posting.applicant_count ?? 0,
    isAdult: posting.isAdult ?? posting.is_adult ?? false,
    isTeen: posting.isTeen ?? posting.is_teen ?? false,
    isGroup: posting.isGroup ?? posting.is_group ?? false,

    actPlace:
      posting.actPlace ??
      posting.address ??
      [posting.sido_name, posting.sigungu_name].filter(Boolean).join(" "),

    managerName: posting.managerName ?? posting.manager_name ?? "",
    managerTel: posting.managerTel ?? posting.manager_tel ?? "",
    managerFax: posting.managerFax ?? posting.manager_fax ?? "",
    managerEmail: posting.managerEmail ?? posting.manager_email ?? "",
    managerAddress: posting.managerAddress ?? posting.manager_address ?? "",

    regionId: posting.regionId ?? posting.region_id ?? posting.region?.id ?? 0,
    regionName:
      posting.regionName ??
      posting.region_name ??
      posting.region?.name ??
      posting.sido_name ??
      "",
    categoryId:
      posting.categoryId ?? posting.category_id ?? posting.category?.id ?? 0,
    categoryName:
      posting.categoryName ??
      posting.category_name ??
      posting.category?.name ??
      "",

    locations: normalizePostingLocations(posting),

    createdAt: posting.createdAt ?? posting.created_at ?? "",
    updatedAt: posting.updatedAt ?? posting.updated_at ?? "",
  };
}

export function getVolunteerPostings(params?: VolunteerPostingListParams) {
  return fetchClient<VolunteerPostingApiPage>(
    buildPostingListEndpoint(params),
    publicOptions,
  ).then((page) => ({
    ...page,
    content: page.content.map(normalizeVolunteerPosting),
  }));
}

export function getVolunteerPosting(postingId: number) {
  return fetchClient<VolunteerPostingApiItem>(
    buildPostingEndpoint(postingId),
    publicOptions,
  ).then(normalizeVolunteerPosting);
}

export function addVolunteerPostingBookmark(postingId: number) {
  return fetchClient<VolunteerPostingBookmark>(
    `${buildPostingEndpoint(postingId)}/bookmark`,
    {
      method: "POST",
    },
  );
}

export function removeVolunteerPostingBookmark(postingId: number) {
  return fetchClient<VolunteerPostingBookmark>(
    `${buildPostingEndpoint(postingId)}/bookmark`,
    {
      method: "DELETE",
    },
  );
}
