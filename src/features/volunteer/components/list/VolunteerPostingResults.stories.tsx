import preview from "../../../../../.storybook/preview";
import { useMemo, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { delay, http, HttpResponse } from "msw";
import { fn } from "storybook/test";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "@/shared/api/apiResponse";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";
import { getGatherApiUrl } from "@/mocks/apiScope";
import type {
  PostingListItem,
  PostingListPage,
} from "@/features/volunteer/types/volunteer.types";
import { createQueryClient } from "@/shared/query/queryClient";

import { VolunteerPostingResults } from "./VolunteerPostingResults";

const postingsEndpoint = getGatherApiUrl("/api/v1/postings");

function getDateAfterToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) =>
      index === 0 ? String(value) : String(value).padStart(2, "0"),
    )
    .join("-");
}

function getDateTimeAfterToday(days: number, time: string) {
  return `${getDateAfterToday(days)}T${time}`;
}

const loadedPostings: PostingListItem[] = [
  {
    sourceType: "POSTING",
    meetingId: null,
    id: 101,
    title: "우리 동네 어린이 도서관 책읽기 봉사",
    organizationName: "마포구립도서관",
    thumbnailUrl: null,
    regionId: 1,
    regionName: "서울 마포구",
    place: "마포구 성산동",
    activityStartAt: getDateTimeAfterToday(7, "10:00:00"),
    activityEndAt: getDateTimeAfterToday(7, "12:00:00"),
    applyDeadlineAt: getDateTimeAfterToday(4, "23:59:59"),
    maxParticipants: 12,
    appliedCount: 5,
    categories: ["EDUCATION"],
    status: "RECRUITING",
  },
  {
    sourceType: "MEETING_RECRUIT",
    meetingId: 501,
    id: 202,
    title: "함께하는 한강공원 플로깅",
    organizationName: "Gather 환경 봉사 모임",
    thumbnailUrl: null,
    regionId: 2,
    regionName: "서울 영등포구",
    place: "한강공원",
    activityStartAt: getDateTimeAfterToday(14, "09:00:00"),
    activityEndAt: getDateTimeAfterToday(14, "11:30:00"),
    applyDeadlineAt: getDateTimeAfterToday(10, "23:59:59"),
    maxParticipants: 20,
    appliedCount: 8,
    categories: ["ENVIRONMENT", "COMMUNITY"],
    status: "RECRUITING",
  },
];

function createPostingPage(content: PostingListItem[]): PostingListPage {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    page: 0,
    size: 20,
  };
}

function createSuccessResponse(
  content: PostingListItem[],
): ApiSuccessResponse<PostingListPage> {
  return {
    success: true,
    data: createPostingPage(content),
    error: null,
  };
}

const loadErrorResponse: ApiErrorResponse = {
  success: false,
  data: null,
  error: {
    code: API_ERROR_CODE.VALIDATION_ERROR,
    message: "봉사 공고 목록 오류 상태를 재현합니다.",
  },
};

function FreshQueryClient({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const meta = preview.meta({
  title: "Features/Volunteer/VolunteerPostingResults",
  component: VolunteerPostingResults,
  parameters: {
    layout: "padded",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  decorators: [
    (Story) => (
      <FreshQueryClient>
        <Story />
      </FreshQueryClient>
    ),
  ],
  args: {
    params: {},
    emptyTitle: "조건에 맞는 봉사 공고가 없어요",
    emptyDescription: "검색어나 필터 조건을 바꿔 다시 확인해 주세요.",
    onSelect: fn(),
  },
  argTypes: {
    params: { control: false },
    onSelect: { control: false },
  },
});

export const Loaded = meta.story({
  beforeEach({ msw }) {
    msw.use(
      http.get(postingsEndpoint, () =>
        HttpResponse.json(createSuccessResponse(loadedPostings)),
      ),
    );
  },
});

export const Loading = meta.story({
  beforeEach({ msw }) {
    msw.use(
      http.get(postingsEndpoint, async () => {
        await delay("infinite");

        return HttpResponse.json(createSuccessResponse([]));
      }),
    );
  },
});

export const Empty = meta.story({
  beforeEach({ msw }) {
    msw.use(
      http.get(postingsEndpoint, () =>
        HttpResponse.json(createSuccessResponse([])),
      ),
    );
  },
});

export const LoadError = meta.story({
  beforeEach({ msw }) {
    // Keep this outside the production retry range for a deterministic error state.
    msw.use(
      http.get(postingsEndpoint, () =>
        HttpResponse.json(loadErrorResponse, { status: 400 }),
      ),
    );
  },
});
