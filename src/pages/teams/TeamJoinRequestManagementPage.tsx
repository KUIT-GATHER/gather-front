import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import {
  useApproveMeetingJoinRequestMutation,
  useRejectMeetingJoinRequestMutation,
} from "@/features/team/hooks/useMeetingJoinRequestMutations";
import { useMeetingJoinRequestsQuery } from "@/features/team/hooks/useMeetingJoinRequestsQuery";
import type {
  MeetingJoinRequest,
  MeetingJoinRequestStatus,
} from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import PageHeader from "@/shared/ui/PageHeader";
import { ChevronDown } from "lucide-react";

type JoinRequestFilter = "ALL" | MeetingJoinRequestStatus;

const FILTER_ITEMS: {
  value: JoinRequestFilter;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
];

const STATUS_LABEL: Record<MeetingJoinRequestStatus, string> = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

function formatRequestedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function TeamJoinRequestManagementPage() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();

  const [activeFilter, setActiveFilter] = useState<JoinRequestFilter>("ALL");

  // 승인·반려 처리 결과를 현재 화면에서 보여주기 위한 임시 상태
  const [processedRequests, setProcessedRequests] = useState<
    MeetingJoinRequest[]
  >([]);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(
    null,
  );

  const joinRequestsQuery = useMeetingJoinRequestsQuery(home.meetingId, {
    enabled: isHost,
  });

  const approveMutation = useApproveMeetingJoinRequestMutation(home.meetingId);

  const rejectMutation = useRejectMeetingJoinRequestMutation(home.meetingId);

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  const pendingRequests = joinRequestsQuery.data ?? [];

  const requests = [
    ...pendingRequests,
    ...processedRequests.filter(
      (processedRequest) =>
        !pendingRequests.some(
          (pendingRequest) =>
            pendingRequest.joinRequestId === processedRequest.joinRequestId,
        ),
    ),
  ];

  const filteredRequests =
    activeFilter === "ALL"
      ? requests
      : requests.filter((request) => request.status === activeFilter);

  const handleApprove = async (request: MeetingJoinRequest) => {
    try {
      const approvedRequest = await approveMutation.mutateAsync(
        request.joinRequestId,
      );

      setProcessedRequests((current) => [
        approvedRequest,
        ...current.filter(
          (item) => item.joinRequestId !== approvedRequest.joinRequestId,
        ),
      ]);
    } catch {
      // mutation의 isError 상태로 오류 문구를 표시합니다.
    }
  };

  const handleReject = async (request: MeetingJoinRequest) => {
    try {
      const rejectedRequest = await rejectMutation.mutateAsync(
        request.joinRequestId,
      );

      setProcessedRequests((current) => [
        rejectedRequest,
        ...current.filter(
          (item) => item.joinRequestId !== rejectedRequest.joinRequestId,
        ),
      ]);
    } catch {
      // mutation의 isError 상태로 오류 문구를 표시합니다.
    }
  };

  const isDecisionPending =
    approveMutation.isPending || rejectMutation.isPending;

  const hasDecisionError = approveMutation.isError || rejectMutation.isError;

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader
        title="가입 신청 관리"
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-[#6D6D6D] px-3 py-1.5 text-[12px] font-medium text-white">
            대기 {pendingRequests.length}건
          </span>
        }
        sticky
      />

      <nav
        aria-label="가입 신청 상태"
        className="-mx-5.5 grid grid-cols-4 border-b border-stroke"
      >
        {FILTER_ITEMS.map((filter) => {
          const selected = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={selected}
              className={cn(
                "relative h-12 text-[14px] font-medium",
                selected ? "text-text" : "text-text-gray-200",
              )}
              onClick={() => {
                setActiveFilter(filter.value);
              }}
            >
              {filter.label}

              {selected ? (
                <span className="absolute right-0 bottom-0 left-0 h-px bg-text" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <section className="pt-4 pb-28">
        {joinRequestsQuery.isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <p className="text-[15px] text-text-gray-200">
              가입 신청을 불러오는 중이에요.
            </p>
          </div>
        ) : joinRequestsQuery.isError ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3">
            <p className="text-[15px] text-text-gray-200">
              가입 신청을 불러오지 못했어요.
            </p>

            <button
              type="button"
              className="h-9 rounded-lg border border-stroke bg-white px-4 text-[13px] font-medium text-text"
              onClick={() => {
                void joinRequestsQuery.refetch();
              }}
            >
              다시 시도
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center">
            <p className="text-[15px] text-text-gray-200">
              해당하는 가입 신청이 없어요.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {filteredRequests.map((request) => {
                const expanded = expandedRequestId === request.joinRequestId;

                return (
                  <li
                    key={request.joinRequestId}
                    className="overflow-hidden rounded-xl border border-stroke bg-white"
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      className="flex w-full items-start justify-between gap-3 p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-button/40"
                      onClick={() => {
                        setExpandedRequestId((current) =>
                          current === request.joinRequestId
                            ? null
                            : request.joinRequestId,
                        );
                      }}
                    >
                      <span className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="grid size-8 shrink-0 place-items-center rounded-full border border-stroke text-[12px] font-medium text-text"
                        >
                          {request.nickname.slice(0, 1)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className="truncate text-[14px] font-medium text-text">
                              {request.nickname}
                            </span>

                            <ChevronDown
                              aria-hidden="true"
                              className={cn(
                                "size-4 shrink-0 text-text-gray-300 transition-transform",
                                expanded && "rotate-180",
                              )}
                            />
                          </span>

                          <span className="mt-1 block text-[11px] text-text-gray-200">
                            신청일: {formatRequestedAt(request.requestedAt)}
                          </span>
                        </span>
                      </span>

                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium",
                          request.status === "PENDING" &&
                            "border border-dashed border-stroke bg-white text-text-gray-300",
                          request.status === "APPROVED" &&
                            "bg-button/10 text-button",
                          request.status === "REJECTED" &&
                            "bg-point-red/10 text-point-red",
                        )}
                      >
                        {STATUS_LABEL[request.status]}
                      </span>
                    </button>

                    {expanded ? (
                      <div className="mx-3 rounded-xl bg-[#F4F8F5] p-3">
                        <p className="mb-3 text-[14px] font-semibold text-text">
                          기본 정보
                        </p>

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                          <div className="flex min-w-0 gap-1">
                            <dt className="shrink-0 text-text-gray-300">
                              전화번호
                            </dt>
                            <dd className="truncate text-text">
                              {request.nickname}
                            </dd>
                          </div>

                          <div className="flex min-w-0 gap-1">
                            <dt className="shrink-0 text-text-gray-300">
                              생년월일
                            </dt>
                            <dd className="truncate text-text">
                              {formatRequestedAt(request.requestedAt)}
                            </dd>
                          </div>

                          <div className="flex min-w-0 gap-1">
                            <dt className="shrink-0 text-text-gray-300">
                              지역
                            </dt>
                            <dd className="truncate text-text">
                              {STATUS_LABEL[request.status]}
                            </dd>
                          </div>

                          <div className="flex min-w-0 gap-1">
                            <dt className="shrink-0 text-text-gray-300">
                              관심 분야
                            </dt>
                            <dd className="truncate text-text">
                              {STATUS_LABEL[request.status]}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ) : null}

                    {request.status === "PENDING" ? (
                      <div className="grid grid-cols-2 gap-2 p-3">
                        <button
                          type="button"
                          disabled={isDecisionPending}
                          className="h-10 rounded-lg border border-button bg-white text-[13px] font-medium text-text disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            void handleReject(request);
                          }}
                        >
                          반려
                        </button>

                        <button
                          type="button"
                          disabled={isDecisionPending}
                          className="h-10 rounded-lg bg-button text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            void handleApprove(request);
                          }}
                        >
                          승인
                        </button>
                      </div>
                    ) : null}

                    {request.status === "REJECTED" ? (
                      <div className="p-3">
                        <button
                          type="button"
                          className="h-10 w-full rounded-lg border border-button bg-white text-[13px] font-medium text-text disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => {
                            // void handleRestore(request);
                          }}
                        >
                          대기로 되돌리기
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {hasDecisionError ? (
              <p
                role="alert"
                className="mt-3 text-center text-[13px] text-point-red"
              >
                가입 신청을 처리하지 못했어요. 다시 시도해 주세요.
              </p>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
