import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import activityBadgeIcon from "@/features/my/assets/activity-badge.svg";
import activityClockIcon from "@/features/my/assets/activity-clock.svg";
import activityHeartIcon from "@/features/my/assets/activity-heart.svg";
import activityNoteIcon from "@/features/my/assets/activity-note.svg";
import { MeetingCategoryTag } from "@/features/team/components/MeetingCategoryTag";
import { POSTING_CATEGORY_LABEL } from "@/features/category/constants/postingCategory.constants";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import communityPuzzle from "@/features/my/assets/activity-puzzle/community.svg";
import culturePuzzle from "@/features/my/assets/activity-puzzle/culture.svg";
import educationPuzzle from "@/features/my/assets/activity-puzzle/education.svg";
import environmentPuzzle from "@/features/my/assets/activity-puzzle/environment.svg";
import overseasPuzzle from "@/features/my/assets/activity-puzzle/overseas.svg";
import welfarePuzzle from "@/features/my/assets/activity-puzzle/welfare.svg";
import {
  useMyActivityRecordsQuery,
  useMyActivitySummaryQuery,
} from "@/features/my/hooks/useMyActivitiesQuery";
import type { MyActivityRecord } from "@/features/my/types/myActivity.types";
import PageHeader from "@/shared/ui/PageHeader";

const PUZZLE_CATEGORIES: PostingCategory[] = [
  "ENVIRONMENT",
  "EDUCATION",
  "WELFARE",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];

const PUZZLE_LEFT = [0, 57, 114.29, 171.52, 228.85, 286.13];

const PUZZLE_ICON: Record<PostingCategory, string> = {
  ENVIRONMENT: environmentPuzzle,
  EDUCATION: educationPuzzle,
  WELFARE: welfarePuzzle,
  CULTURE: culturePuzzle,
  COMMUNITY: communityPuzzle,
  OVERSEAS: overseasPuzzle,
};

const PUZZLE_COUNT_COLOR: Record<PostingCategory, string> = {
  ENVIRONMENT: "text-[#558681]",
  EDUCATION: "text-[#545c8a]",
  WELFARE: "text-[#815e81]",
  CULTURE: "text-[#8e7e59]",
  COMMUNITY: "text-[#838d85]",
  OVERSEAS: "text-[#677f98]",
};

const PUZZLE_LINE_COLOR: Record<PostingCategory, string> = {
  ENVIRONMENT: "bg-[#558681]",
  EDUCATION: "bg-[#545c8a]",
  WELFARE: "bg-[#815e81]",
  CULTURE: "bg-[#8e7e59]",
  COMMUNITY: "bg-[#828d84]",
  OVERSEAS: "bg-[#677f98]",
};

const ACTIVITY_BORDER: Record<PostingCategory, string> = {
  ENVIRONMENT: "border-[#82d3ca]",
  EDUCATION: "border-[#828ed2]",
  WELFARE: "border-[#d197d1]",
  CULTURE: "border-[#fade9e]",
  COMMUNITY: "border-[#dcecdf]",
  OVERSEAS: "border-[#a6ccf4]",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(date: string | null) {
  if (!date) return "일시 미정";
  const parsed = new Date(`${date}T00:00:00`);
  return `${date.replaceAll("-", ".")} (${WEEKDAYS[parsed.getDay()]})`;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder}분`;
  return remainder ? `${hours}시간 ${remainder}분` : `${hours}시간`;
}

function getActivityRecognitionLabel(activity: MyActivityRecord) {
  if (!activity.timeCertifiable || activity.recognizedMinutes === null) {
    return "미인증";
  }

  return formatMinutes(activity.recognizedMinutes);
}

function StatIcon({
  src,
  className,
  iconClassName,
}: {
  src: string;
  className: string;
  iconClassName: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
    >
      <img src={src} alt="" aria-hidden="true" className={iconClassName} />
    </span>
  );
}

export function MyActivitiesScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<PostingCategory | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const summaryQuery = useMyActivitySummaryQuery();
  const recordsQuery = useMyActivityRecordsQuery(selectedCategory);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = recordsQuery;
  const summary = summaryQuery.data;
  const records =
    recordsQuery.data?.pages.flatMap((page) => page.content) ?? [];
  const categoryCounts = new Map(
    summary?.categoryBlocks.map(({ category, count }) => [category, count]),
  );

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg px-5.5 pb-10">
      <PageHeader title="완료한 활동" onBack={() => navigate(-1)} />

      <main className="pt-5">
        <section aria-labelledby="activity-summary-title">
          <h2 id="activity-summary-title" className="text-title-18">
            활동 현황
          </h2>

          <div className="mt-3 grid grid-cols-[1.42fr_1fr] gap-3">
            <article className="flex min-h-[164px] flex-col items-center justify-center gap-4 rounded-[20px] border border-stroke bg-white px-4 py-5">
              <StatIcon
                src={activityHeartIcon}
                className="size-16 bg-[#e4f3e8]"
                iconClassName="size-9"
              />
              <div className="text-center">
                <strong className="block text-title-18">
                  {formatMinutes(summary?.totalRecognizedMinutes ?? 0)}
                </strong>
                <span className="mt-1 block text-base font-medium text-text-green-500">
                  봉사 시간
                </span>
              </div>
            </article>

            <div className="grid gap-4">
              <article className="flex min-h-[74px] items-center gap-4 rounded-[20px] border border-stroke bg-white px-3">
                <StatIcon
                  src={activityNoteIcon}
                  className="size-[42px] bg-[#e5f1f8]"
                  iconClassName="size-5"
                />
                <div>
                  <strong className="block text-body-15-semibold">
                    {summary?.totalCompletedCount ?? 0}건
                  </strong>
                  <span className="text-body-14 font-medium text-text-green-500">
                    총 활동
                  </span>
                </div>
              </article>
              <article className="flex min-h-[74px] items-center gap-4 rounded-[20px] border border-stroke bg-white px-3">
                <StatIcon
                  src={activityClockIcon}
                  className="size-[42px] bg-[#eee8fa]"
                  iconClassName="h-[22px] w-5"
                />
                <div>
                  <strong className="block text-body-15-semibold">
                    {summary?.timeCertifiableCompletedCount ?? 0}건
                  </strong>
                  <span className="text-body-14 font-medium text-text-green-500">
                    시간 인증
                  </span>
                </div>
              </article>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/my/badges")}
            className="mt-6 flex min-h-[74px] w-full items-center gap-4 rounded-[20px] border border-stroke bg-white p-5 text-left"
          >
            <StatIcon
              src={activityBadgeIcon}
              className="size-12 bg-[#fcecc8]"
              iconClassName="size-6"
            />
            <span className="flex-1 text-body-15-semibold">
              지금까지 모은 뱃지를 확인해보세요!
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-7 shrink-0 text-text-gray-400"
            />
          </button>
        </section>

        <section className="mt-16" aria-labelledby="puzzle-summary-title">
          <h2 id="puzzle-summary-title" className="text-title-18">
            함께한 조각
          </h2>

          <div className="relative mt-7 h-[191px]">
            {PUZZLE_CATEGORIES.map((category, index) => ({ category, index }))
              .reverse()
              .map(({ category, index }) => (
                <div
                  key={category}
                  className="absolute top-0 w-[72px]"
                  style={{ left: PUZZLE_LEFT[index] }}
                >
                  <span
                    className={`absolute left-[29px] -translate-x-1/2 whitespace-nowrap text-body-14 font-medium ${index % 2 === 0 ? "top-[174px]" : "top-0"}`}
                  >
                    {POSTING_CATEGORY_LABEL[category]}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute left-[29px] h-[60px] w-[0.5px] -translate-x-1/2 ${PUZZLE_LINE_COLOR[category]} ${index % 2 === 0 ? "top-[106px]" : "top-[22px]"}`}
                  />
                  <div
                    className={`absolute h-[71.864px] w-[71.87px] ${index % 2 === 0 ? "top-[51px]" : "top-[65px]"}`}
                  >
                    <img
                      src={PUZZLE_ICON[category]}
                      alt=""
                      aria-hidden="true"
                      className={`size-full ${category === "ENVIRONMENT" ? "-scale-y-100" : ""}`}
                    />
                    <span
                      className={`absolute text-[15px] font-medium ${index % 2 === 0 ? "left-1 top-[17px]" : "left-9 top-[39px]"} ${PUZZLE_COUNT_COLOR[category]}`}
                    >
                      {String(categoryCounts.get(category) ?? 0).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="mt-9" aria-label="완료한 활동 목록">
          <div className="-mx-5.5 overflow-x-auto px-5.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex h-11 items-center rounded-[30px] px-4 text-xs font-semibold ${
                  selectedCategory === null
                    ? "bg-text-gray-400 text-text2"
                    : "border border-stroke bg-white text-text-gray-400"
                }`}
              >
                전체
              </button>
              {PUZZLE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                >
                  <MeetingCategoryTag
                    category={category}
                    selected={selectedCategory === category}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {records.map((activity) => (
              <article
                key={activity.participationId}
                className={`flex h-[73px] items-start justify-between gap-3 rounded-xl border bg-white px-3 py-4 ${ACTIVITY_BORDER[activity.category]}`}
              >
                <div className="min-w-0">
                  <h3 className="truncate text-body-15-semibold">
                    {activity.title}
                  </h3>
                  <p className="mt-2 truncate text-body-14 text-text-gray-100">
                    {formatDate(activity.actStartDate)}{" "}
                    {activity.actPlace ?? "장소 미정"}
                  </p>
                </div>
                <span className="shrink-0 rounded-[10px] bg-text-gray-400 px-2 py-0.5 text-body-14 text-text2">
                  {getActivityRecognitionLabel(activity)}
                </span>
              </article>
            ))}
            {recordsQuery.isLoading ? (
              <p className="py-6 text-center text-body-14 text-text-gray-100">
                활동 기록을 불러오는 중이에요.
              </p>
            ) : null}
            {recordsQuery.isError && records.length === 0 ? (
              <button
                type="button"
                onClick={() => void recordsQuery.refetch()}
                className="w-full py-6 text-center text-body-14 text-text-gray-400"
              >
                활동 기록을 불러오지 못했어요. 다시 시도
              </button>
            ) : null}
            {!recordsQuery.isLoading &&
            !recordsQuery.isError &&
            records.length === 0 ? (
              <p className="py-6 text-center text-body-14 text-text-gray-100">
                완료한 활동이 없어요.
              </p>
            ) : null}
            <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          </div>
        </section>
      </main>
    </div>
  );
}
