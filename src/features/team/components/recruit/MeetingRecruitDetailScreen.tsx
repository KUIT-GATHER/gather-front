import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CategoryBadge } from "@/features/category/components/CategoryBadge";
import { useToggleMeetingRecruitParticipationMutation } from "@/features/team/hooks/useMeetingRecruitMutations";
import { ApiError } from "@/shared/api/apiError";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

export function MeetingRecruitDetailScreen({
  meetingId,
  postId,
}: {
  meetingId: number;
  postId: number;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const recruitQuery = useQuery(
    teamQueries.recruitForViewer(
      meetingId,
      postId,
      authInitialized && isAuthenticated,
    ),
  );
  const imagesQuery = useQuery(teamQueries.images(meetingId));
  const participationMutation = useToggleMeetingRecruitParticipationMutation(
    meetingId,
    postId,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (recruitQuery.isLoading)
    return (
      <LoadingState className="min-h-dvh" label="봉사 공고를 불러오는 중" />
    );
  if (recruitQuery.isError) {
    const forbidden =
      recruitQuery.error instanceof ApiError &&
      recruitQuery.error.status === 403;
    return (
      <PageContainer className="min-h-dvh">
        <PageHeader title="봉사 공고" onBack={() => navigate(-1)} />
        <ErrorState
          className="mt-24"
          title={
            forbidden
              ? "접근할 수 없는 공고예요"
              : "봉사 공고를 불러오지 못했어요"
          }
          description={
            forbidden
              ? "승인된 모임원에게만 공개된 공고예요."
              : "잠시 후 다시 시도해 주세요."
          }
          primaryAction={{
            label: "다시 시도",
            onClick: () => void recruitQuery.refetch(),
          }}
        />
      </PageContainer>
    );
  }
  const recruit = recruitQuery.data;
  if (!recruit) return null;
  const actionLabel =
    recruit.participationAction === "APPLY"
      ? "신청하기"
      : recruit.participationAction === "CANCEL"
        ? "신청 취소"
        : recruit.participationStatus === "CONFIRMED"
          ? "참가 확정"
          : recruit.participationStatus === "COMPLETED" ||
              recruit.participationStatus === "REVIEWED"
            ? "활동 완료"
            : recruit.participationStatus === "REJECTED"
              ? "신청 반려"
              : "신청할 수 없어요";

  const requestParticipation = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <PageContainer className="min-h-dvh pb-32">
      <PageHeader title={recruit.title} onBack={() => navigate(-1)} sticky />
      <article className="pt-2">
        {imagesQuery.data?.imageUrls[0] ? (
          <img
            src={imagesQuery.data.imageUrls[0]}
            alt={`${recruit.meetingName} 대표 이미지`}
            className="aspect-[1.9] w-full rounded-xl border border-stroke object-cover"
          />
        ) : (
          <div className="grid aspect-[1.9] w-full place-items-center rounded-xl border border-stroke bg-gradient-to-br from-white to-point-green/25 text-3xl font-semibold text-button">
            Gather
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {recruit.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
        <h1 className="mt-4 text-2xl font-semibold leading-8">
          {recruit.title}
        </h1>
        <p className="mt-4 whitespace-pre-line text-base leading-7">
          {recruit.content}
        </p>
        <section className="mt-6 rounded-xl border border-stroke bg-white p-4">
          <dl className="space-y-3 text-sm">
            <div className="flex gap-3">
              <MapPin className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">장소</dt>
              <dd className="ml-auto text-right">
                {recruit.regionName} {recruit.place}
              </dd>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">날짜</dt>
              <dd className="ml-auto text-right">
                {recruit.activityStartAt.slice(0, 10)} ~{" "}
                {recruit.activityEndAt.slice(0, 10)}
              </dd>
            </div>
            <div className="flex gap-3">
              <Clock3 className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">시간</dt>
              <dd className="ml-auto text-right">
                {recruit.activityStartAt.slice(11, 16)} ~{" "}
                {recruit.activityEndAt.slice(11, 16)}
              </dd>
            </div>
            <div className="flex gap-3">
              <Users className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">참여 인원</dt>
              <dd className="ml-auto text-right">
                {recruit.appliedCount}/{recruit.maxParticipants}명
              </dd>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">신청 마감</dt>
              <dd className="ml-auto text-right">
                {recruit.applyDeadlineAt.slice(0, 16).replace("T", " ")}
              </dd>
            </div>
            <div className="flex gap-3">
              <Clock3 className="size-5 text-icon" />
              <dt className="w-20 text-text-gray-300">시간 인정</dt>
              <dd className="ml-auto text-right">
                {recruit.timeRecognized
                  ? `${recruit.recognizedMinutes ?? 0}분`
                  : "미인정"}
              </dd>
            </div>
          </dl>
        </section>
        <section className="mt-6">
          <h2 className="text-lg font-semibold">함께하는 팀</h2>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-stroke bg-white p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
            onClick={() => navigate(`/teams/${meetingId}`)}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-point-green/10 text-sm font-semibold text-button">
              모임
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {recruit.meetingName}
              </span>
              <span className="mt-1 block text-sm text-text-gray-300">
                모집 활동을 만든 모임
              </span>
            </span>
            <ChevronRight
              className="size-6 text-text-gray-300"
              aria-hidden="true"
            />
          </button>
        </section>
        {actionError ? (
          <p role="alert" className="mt-4 text-sm text-point-red">
            {actionError}
          </p>
        ) : null}
      </article>
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 border-t border-stroke bg-white px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button
          fullWidth
          disabled={
            recruit.participationAction === "NONE" ||
            participationMutation.isPending
          }
          variant={
            recruit.participationAction === "CANCEL"
              ? "primaryOutline"
              : "primary"
          }
          onClick={requestParticipation}
        >
          {participationMutation.isPending ? "처리 중" : actionLabel}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={
          recruit.participationAction === "CANCEL"
            ? "봉사 신청을 취소하시겠어요?"
            : "이 봉사에 신청하시겠어요?"
        }
        confirmText={
          recruit.participationAction === "CANCEL" ? "취소하기" : "신청"
        }
        isPending={participationMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setActionError(null);
          participationMutation.mutate(undefined, {
            onSuccess: () => setConfirmOpen(false),
            onError: () => {
              setConfirmOpen(false);
              setActionError(
                "신청 상태를 변경하지 못했어요. 마감 또는 확정 상태를 확인해 주세요.",
              );
            },
          });
        }}
      />
    </PageContainer>
  );
}
