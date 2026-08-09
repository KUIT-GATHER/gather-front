import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Crown } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";
import { MeetingPersonDetail } from "@/features/team/components/management/MeetingPersonDetail";
import { useRemoveMeetingMemberMutation } from "@/features/team/hooks/useMeetingManagementMutations";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import type { MeetingMember } from "@/features/team/types/team.types";
import { ApiError } from "@/shared/api/apiError";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

function isHostMember(member: MeetingMember) {
  return member.host || member.role === "HOST";
}

export function TeamMemberManagementScreen() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MeetingMember | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const detailQuery = useQuery({
    ...teamQueries.member(home.meetingId, expandedUserId ?? 0),
    enabled: isHost && expandedUserId !== null,
  });
  const removeMutation = useRemoveMeetingMemberMutation(home.meetingId);
  const members = useMemo(
    () =>
      [...home.members].sort(
        (a, b) => Number(isHostMember(b)) - Number(isHostMember(a)),
      ),
    [home.members],
  );

  if (!isHost) return <Navigate to={`/teams/${home.meetingId}`} replace />;

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader title="멤버 관리" onBack={() => navigate(-1)} sticky />
      <section className="pb-28 pt-6">
        <ul className="flex flex-col gap-3">
          {members.map((member) => {
            const leader = isHostMember(member);
            const expanded = expandedUserId === member.userId;
            return (
              <li
                key={member.userId}
                className="overflow-hidden rounded-xl border border-stroke bg-white"
              >
                <div className="flex min-h-16 items-center gap-3 px-4">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
                    onClick={() =>
                      setExpandedUserId(expanded ? null : member.userId)
                    }
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-stroke text-xs">
                      {member.nickname.slice(0, 1)}
                    </span>

                    <span className="flex min-w-0 items-center gap-1">
                      <span className="truncate text-base font-medium">
                        {member.nickname}
                      </span>

                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-text-gray-300 transition",
                          expanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                  {leader ? (
                    <Crown aria-label="팀장" className="size-5 text-icon" />
                  ) : (
                    <Button
                      variant="dangerOutline"
                      size="medium"
                      className="h-7 rounded-lg px-3 text-xs hover:bg-point-red hover:text-text2"
                      onClick={() => setRemoveTarget(member)}
                    >
                      내보내기
                    </Button>
                  )}
                </div>
                {expanded ? (
                  <div className="mx-3 mb-3 rounded-xl bg-point-green/10 p-3">
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
              </li>
            );
          })}
        </ul>
        {removeError ? (
          <p role="alert" className="mt-4 text-sm text-point-red">
            {removeError}
          </p>
        ) : null}
      </section>
      <ConfirmDialog
        open={removeTarget !== null}
        title="해당 팀원을 모임에서 내보내시겠습니까?"
        description="작성한 글과 완료 활동 기록은 유지됩니다."
        confirmVariant="danger"
        isPending={removeMutation.isPending}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return;
          setRemoveError(null);
          removeMutation.mutate(removeTarget.userId, {
            onSuccess: () => setRemoveTarget(null),
            onError: (error) => {
              setRemoveTarget(null);
              setRemoveError(
                error instanceof ApiError && error.status === 409
                  ? "확정된 예정 활동이 있어 해당 멤버를 내보낼 수 없어요."
                  : "멤버를 내보내지 못했어요.",
              );
            },
          });
        }}
      />
    </main>
  );
}
