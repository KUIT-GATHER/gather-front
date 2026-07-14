import { useNavigate } from "react-router";

import { useVolunteerPostingDetail } from "@/features/volunteer/hooks/useVolunteerPostingDetail";
import type { VolunteerPosting } from "@/features/volunteer/types/volunteer.types";
import Button from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type VolunteerPostingDetailProps = {
  postingId: number;
};

const statusLabels: Record<VolunteerPosting["status"], string> = {
  RECRUITING: "모집중",
  CLOSED: "모집마감",
  COMPLETED: "활동완료",
};

function formatDateRange(startDate: string, endDate: string) {
  return startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} ~ ${endTime}`;
}

function getParticipationConditions(posting: VolunteerPosting) {
  const conditions = [];

  if (posting.isAdult) conditions.push("성인");
  if (posting.isTeen) conditions.push("청소년");
  if (posting.isGroup) conditions.push("단체");

  return conditions.length > 0
    ? `${conditions.join(" 및 ")} 신청 가능`
    : "별도 신청 조건 없음";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-body-14">
      <dt className="shrink-0 text-text-gray-300">{label}</dt>
      <dd className="text-right text-text">{value}</dd>
    </div>
  );
}

export function VolunteerPostingDetail({
  postingId,
}: VolunteerPostingDetailProps) {
  const navigate = useNavigate();
  const postingQuery = useVolunteerPostingDetail(postingId);

  if (postingQuery.isLoading) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <LoadingState
          label="봉사 공고를 불러오는 중"
          className="min-h-[calc(100dvh-7rem)]"
        />
      </>
    );
  }

  if (postingQuery.isError) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <ErrorState
          className="min-h-[calc(100dvh-7rem)] justify-center"
          title="봉사 공고를 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          primaryAction={{
            label: "다시 시도",
            onClick: () => {
              void postingQuery.refetch();
            },
          }}
          secondaryAction={{
            label: "이전 페이지",
            onClick: () => navigate(-1),
          }}
        />
      </>
    );
  }

  const posting = postingQuery.data;

  if (!posting) {
    return (
      <>
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <EmptyState
          className="mt-10"
          title="봉사 공고가 없어요"
          description="요청한 봉사 공고를 찾을 수 없어요."
          actionLabel="이전 페이지"
          onAction={() => navigate(-1)}
        />
      </>
    );
  }

  return (
    <article className="pb-[calc(env(safe-area-inset-bottom)+6rem)]">
      <PageHeader title="봉사 공고" onBack={() => navigate(-1)} sticky />

      <div className="flex flex-col gap-5 pt-3">
        <section>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-point-green/15 px-2.5 py-1 text-xs font-medium text-icon">
                  {posting.categoryName}
                </span>
                <span className="rounded-full bg-button/10 px-2.5 py-1 text-xs font-medium text-button">
                  {posting.regionName}
                </span>
                <span className="rounded-full bg-stroke/50 px-2.5 py-1 text-xs font-medium text-text-gray-300">
                  {statusLabels[posting.status]}
                </span>
              </div>

              <h1 className="text-title-24 text-text">{posting.title}</h1>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-body-14 text-text-gray-300">
            {posting.content}
          </p>
        </section>

        <section className="rounded-2xl border border-stroke bg-white p-4">
          <dl className="flex flex-col gap-3">
            <DetailRow label="장소" value={posting.actPlace} />
            <DetailRow
              label="날짜"
              value={formatDateRange(
                posting.actStartDate,
                posting.actEndDate,
              )}
            />
            <DetailRow
              label="시간"
              value={formatTimeRange(
                posting.actStartTime,
                posting.actEndTime,
              )}
            />
            <DetailRow
              label="참여 인원"
              value={`${posting.applicantCount}/${posting.recruitCount}명`}
            />
            <DetailRow label="신청 마감" value={posting.noticeEndDate} />
            <DetailRow label="봉사 기관명" value={posting.recruitOrg} />
            <DetailRow label="포털 등록 기관명" value={posting.registerOrg} />
          </dl>
        </section>

        <section className="rounded-2xl border border-stroke bg-white p-4">
          <h2 className="text-body-15-semibold text-text">참여 조건</h2>
          <p className="mt-2 text-body-14 text-text-gray-300">
            {getParticipationConditions(posting)}
          </p>
        </section>

        {posting.locations.length > 0 ? (
          <section className="rounded-2xl border border-stroke bg-white p-4">
            <h2 className="text-body-15-semibold text-text">상세 장소</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {posting.locations.map((location) => (
                <li
                  key={location.locationSeq}
                  className="text-body-14 text-text-gray-300"
                >
                  {location.address}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 bg-bg px-5.5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button fullWidth className="h-12 text-base font-normal">
          신청하기
        </Button>
      </div>
    </article>
  );
}
