import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import CalendarIcon from "@/assets/volunteer/calender.svg";
import LocationIcon from "@/assets/volunteer/location.svg";
import { useMyMeetingActivityAppliedRecruitsQuery } from "@/features/team/hooks/useMyMeetingActivityQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import type { MyAppliedRecruit } from "@/features/team/types/team.types";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatActivityDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day} (${WEEKDAYS[date.getDay()]})`;
}

function formatActivityTimeRange(
  startTime: string | null,
  endTime: string | null,
) {
  if (!startTime && !endTime) {
    return null;
  }

  if (!startTime) {
    return endTime;
  }

  if (!endTime) {
    return startTime;
  }

  return `${startTime} - ${endTime}`;
}

function getAppliedRecruitStatusLabel(status: MyAppliedRecruit["status"]) {
  switch (status) {
    case "APPLIED":
      return "신청 완료";
  }
}

function AppliedRecruitCard({ recruit }: { recruit: MyAppliedRecruit }) {
  const navigate = useNavigate();
  const timeRange = formatActivityTimeRange(
    recruit.actStartTime,
    recruit.actEndTime,
  );
  const dateLabel = timeRange
    ? `${formatActivityDate(recruit.actDate)} ${timeRange}`
    : formatActivityDate(recruit.actDate);

  return (
    <button
      type="button"
      onClick={() =>
        navigate(`/teams/${recruit.meetingId}/posts/${recruit.postId}`)
      }
      className="w-full rounded-xl border border-stroke bg-white px-4 py-3 text-left transition hover:border-point-green hover:bg-[#f0f6f0] active:border-point-green active:bg-[#f0f6f0] focus:outline-none focus-visible:border-point-green focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-point-green/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] leading-5 font-semibold text-text">
            {recruit.title}
          </h2>

          <div className="mt-3 flex flex-col gap-2">
            <p className="flex min-w-0 items-center gap-1 text-[14px] leading-4 text-text-gray-400">
              <img
                src={CalendarIcon}
                alt=""
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <span className="truncate">{dateLabel}</span>
            </p>

            <p className="flex min-w-0 items-center gap-1 text-[14px] leading-4 text-text-gray-400">
              <img
                src={LocationIcon}
                alt=""
                aria-hidden="true"
                className="h-5 w-4 shrink-0"
              />
              <span className="truncate">{recruit.place ?? "장소 미정"}</span>
            </p>
          </div>
        </div>

        <span className="mt-14 shrink-0 text-[15px] leading-4 font-medium text-point-red">
          {getAppliedRecruitStatusLabel(recruit.status)}
        </span>
      </div>
    </button>
  );
}

export function TeamActivityAppliedRecruitsScreen() {
  const { meetingId } = useTeamDetailContext();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const recruitsQuery = useMyMeetingActivityAppliedRecruitsQuery(meetingId);
  const recruits =
    recruitsQuery.data?.pages.flatMap((page) => page.content) ?? [];

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          recruitsQuery.hasNextPage &&
          !recruitsQuery.isFetchingNextPage &&
          !recruitsQuery.isFetchNextPageError
        ) {
          void recruitsQuery.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [recruitsQuery]);

  if (recruitsQuery.isLoading && recruits.length === 0) {
    return (
      <LoadingState
        label="신청한 봉사를 불러오는 중"
        className="min-h-65 px-5.5"
      />
    );
  }

  if (recruitsQuery.isError && recruits.length === 0) {
    return (
      <ErrorState
        title="신청한 봉사를 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        className="min-h-65 justify-center px-5.5"
        primaryAction={{
          label: "다시 시도",
          onClick: () => {
            void recruitsQuery.refetch();
          },
        }}
      />
    );
  }

  return (
    <section className="px-5.5 py-5" aria-label="내가 신청한 봉사 목록">
      {recruits.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {recruits.map((recruit) => (
            <li key={`${recruit.meetingId}-${recruit.postId}`}>
              <AppliedRecruitCard recruit={recruit} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
          아직 신청한 봉사가 없어요.
        </p>
      )}

      <div ref={loadMoreRef} aria-hidden="true" className="h-1" />

      {recruitsQuery.isFetchingNextPage ? (
        <LoadingState
          label="신청한 봉사를 더 불러오는 중"
          className="min-h-24"
        />
      ) : null}

      {recruitsQuery.isFetchNextPageError ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-gray-400">
            신청한 봉사를 더 불러오지 못했어요.
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-button focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => void recruitsQuery.fetchNextPage()}
          >
            다시 시도
          </button>
        </div>
      ) : null}
    </section>
  );
}
