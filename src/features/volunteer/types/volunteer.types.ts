export type VolunteerPostingStatus = "RECRUITING" | "CLOSED" | "COMPLETED";

export type VolunteerPostingLocation = {
  locationSeq: number;
  address: string;
  latitude: number;
  longitude: number;
};

export type VolunteerPosting = {
  id: number;
  title: string;
  status: VolunteerPostingStatus;
  content: string;

  recruitOrg: string;
  registerOrg: string;

  actStartDate: string;
  actEndDate: string;
  actStartTime: string;
  actEndTime: string;
  noticeStartDate: string;
  noticeEndDate: string;
  actWkdy: string;

  recruitCount: number;
  applicantCount: number;
  isAdult: boolean;
  isTeen: boolean;
  isGroup: boolean;

  actPlace: string;

  managerName: string;
  managerTel: string;
  managerFax: string;
  managerEmail: string;
  managerAddress: string;

  regionId: number;
  regionName: string;
  categoryId: number;
  categoryName: string;

  locations: VolunteerPostingLocation[];

  createdAt: string;
  updatedAt: string;
};

export type VolunteerPostingListItem = Pick<
  VolunteerPosting,
  | "id"
  | "title"
  | "status"
  | "recruitOrg"
  | "actStartDate"
  | "actEndDate"
  | "actPlace"
  | "recruitCount"
  | "applicantCount"
  | "regionId"
  | "regionName"
  | "categoryId"
  | "categoryName"
>;

export type VolunteerPostingPage = {
  content: VolunteerPostingListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

type VolunteerPostingRegionFilter =
  | {
      regionId?: never;
      regionGroupId?: never;
    }
  | {
      regionId: number;
      regionGroupId?: never;
    }
  | {
      regionId?: never;
      regionGroupId: number;
    };

type VolunteerPostingBaseParams = {
  page?: number;
  size?: number;
  sort?: string[];
  status?: VolunteerPostingStatus;
  noticeStartDate?: string;
  noticeEndDate?: string;
  keyword?: string;
};

export type VolunteerPostingListParams = VolunteerPostingBaseParams &
  VolunteerPostingRegionFilter;

export type VolunteerPostingBookmark = {
  postingId: number;
  bookmarked: boolean;
};
