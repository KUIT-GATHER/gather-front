import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { MeetingPersonDetail } from "@/features/team/components/management/MeetingPersonDetail";
import { useRestoreMeetingJoinRequestMutation } from "@/features/team/hooks/useMeetingManagementMutations";
import {
  useApproveMeetingJoinRequestMutation,
  useRejectMeetingJoinRequestMutation,
} from "@/features/team/hooks/useMeetingJoinRequestMutations";
import { useMeetingJoinRequestsQuery } from "@/features/team/hooks/useMeetingJoinRequestsQuery";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import type { MeetingJoinRequestStatus } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type Filter = "ALL" | MeetingJoinRequestStatus;
const filters: Array<{ value: Filter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
];
const statusLabel: Record<MeetingJoinRequestStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

export function TeamJoinRequestManagementScreen() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const requestsQuery = useMeetingJoinRequestsQuery(home.meetingId, {
    enabled: isHost,
  });
  const detailQuery = useQuery({
    ...teamQueries.joinRequest(home.meetingId, expandedId ?? 0),
    enabled: isHost && expandedId !== null,
  });
  const approveMutation = useApproveMeetingJoinRequestMutation(home.meetingId);
  const rejectMutation = useRejectMeetingJoinRequestMutation(home.meetingId);
  const restoreMutation = useRestoreMeetingJoinRequestMutation(home.meetingId);
  if (!isHost) return <Navigate to={`/teams/${home.meetingId}`} replace />;
  const requests = requestsQuery.data ?? [];
  const filtered =
    filter === "ALL"
      ? requests
      : requests.filter((request) => request.status === filter);
  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length;
  const decisionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    restoreMutation.isPending;

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader
        title="가입 신청 관리"
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-text-gray-400 px-3 py-1.5 text-xs text-white">
            대기 {pendingCount}건
          </span>
        }
        sticky
      />
      <nav
        aria-label="가입 신청 상태"
        className="-mx-5.5 grid grid-cols-4 border-b border-stroke"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            className={cn(
              "relative h-12 text-sm",
              filter === item.value
                ? "font-semibold text-text"
                : "text-text-gray-200",
            )}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
            {filter === item.value ? (
              <span className="absolute inset-x-0 bottom-0 h-px bg-text" />
            ) : null}
          </button>
        ))}
      </nav>
      <section className="pb-28 pt-4">
        {requestsQuery.isLoading ? (
          <LoadingState className="min-h-60" label="가입 신청을 불러오는 중" />
        ) : requestsQuery.isError ? (
          <ErrorState
            className="min-h-60"
            title="가입 신청을 불러오지 못했어요"
            primaryAction={{
              label: "다시 시도",
              onClick: () => void requestsQuery.refetch(),
            }}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            className="min-h-60"
            title="해당하는 가입 신청이 없어요"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((request) => {
              const expanded = expandedId === request.joinRequestId;
              return (
                <li
                  key={request.joinRequestId}
                  className="overflow-hidden rounded-xl border border-stroke bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`join-detail-${request.joinRequestId}`}
                    className="flex w-full items-center gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={() =>
                      setExpandedId(expanded ? null : request.joinRequestId)
                    }
                  >
                    <span className="grid size-8 place-items-center rounded-full border border-stroke text-xs">
                      {request.nickname.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        {request.nickname}
                        <ChevronDown
                          className={cn(
                            "size-4 transition",
                            expanded && "rotate-180",
                          )}
                        />
                      </span>
                      <span className="mt-1 block text-xs text-text-gray-200">
                        신청일{" "}
                        {request.requestedAt.slice(0, 10).replaceAll("-", ".")}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-1 text-xs",
                        request.status === "PENDING"
                          ? "border border-dashed border-stroke"
                          : request.status === "APPROVED"
                            ? "bg-button/10 text-button"
                            : "bg-point-red/10 text-point-red",
                      )}
                    >
                      {statusLabel[request.status]}
                    </span>
                  </button>
                  {expanded ? (
                    <div
                      id={`join-detail-${request.joinRequestId}`}
                      className="mx-3 rounded-xl bg-point-green/10 p-3"
                    >
                      {detailQuery.isLoading ? (
                        <LoadingState
                          className="min-h-20"
                          label="상세 정보를 불러오는 중"
                        />
                      ) : detailQuery.isError ? (
                        <ErrorState
                          className="min-h-20"
                          title="상세 정보를 불러오지 못했어요"
                        />
                      ) : detailQuery.data ? (
                        <MeetingPersonDetail {...detailQuery.data} />
                      ) : null}
                    </div>
                  ) : null}
                  {request.status === "PENDING" ? (
                    <div className="grid grid-cols-2 gap-2 p-3">
                      <Button
                        variant="primaryOutline"
                        size="medium"
                        disabled={decisionPending}
                        onClick={() =>
                          rejectMutation.mutate(request.joinRequestId)
                        }
                      >
                        반려
                      </Button>
                      <Button
                        size="medium"
                        disabled={decisionPending}
                        onClick={() =>
                          approveMutation.mutate(request.joinRequestId)
                        }
                      >
                        승인
                      </Button>
                    </div>
                  ) : request.status === "REJECTED" ? (
                    <div className="p-3">
                      <Button
                        variant="primaryOutline"
                        size="medium"
                        fullWidth
                        disabled={decisionPending}
                        onClick={() =>
                          restoreMutation.mutate(request.joinRequestId)
                        }
                      >
                        대기로 되돌리기
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
