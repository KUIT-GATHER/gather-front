import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import CrownIcon from "@/assets/team/crown.svg";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import type { MeetingMember } from "@/features/team/types/team.types";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import PageHeader from "@/shared/ui/PageHeader";

function isLeaderMember(member: MeetingMember) {
  return member.host || member.role === "HOST";
}

export function TeamMemberManagementPage() {
  const navigate = useNavigate();
  const { home, isHost } = useTeamDetailContext();

  const [selectedMember, setSelectedMember] = useState<MeetingMember | null>(
    null,
  );

  const [memberList, setMemberList] = useState<MeetingMember[]>(() => [
    ...home.members,
  ]);

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  const members = [...memberList].sort(
    (firstMember, secondMember) =>
      Number(isLeaderMember(secondMember)) -
      Number(isLeaderMember(firstMember)),
  );

  const handleMemberClick = (member: MeetingMember) => {
    console.log("상세 정보를 확인할 멤버:", member);

    // 멤버 상세 페이지 연결 예정
    // navigate(
    //   `/teams/${home.meetingId}/settings/members/${member.userId}`,
    // );
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;

    console.log("내보낼 멤버:", selectedMember);

    setMemberList((current) =>
      current.filter((member) => member.userId !== selectedMember.userId),
    );

    setSelectedMember(null);
  };

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader title="멤버 관리" onBack={() => navigate(-1)} sticky />

      <section className="pb-28 pt-6">
        <ul className="flex flex-col gap-2">
          {members.map((member) => {
            const isLeader = isLeaderMember(member);

            return (
              <li
                key={member.userId}
                className="flex h-[72px]  items-center rounded-xl border border-stroke bg-white px-5 py-5"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none"
                  onClick={() => {
                    handleMemberClick(member);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border border-stroke text-[12px] font-medium text-text"
                  >
                    {member.nickname.slice(0, 1)}
                  </span>

                  <span className="truncate text-[16px] font-medium text-text">
                    {member.nickname}
                  </span>
                </button>

                {isLeader ? (
                  <img src={CrownIcon} alt="팀장" className="size-6 shrink-0" />
                ) : (
                  <button
                    type="button"
                    className="h-6 shrink-0 bg-[#FAEEEE] rounded-lg border border-point-red px-3 text-[12px] font-medium text-point-red"
                    onClick={() => {
                      setSelectedMember(member);
                    }}
                  >
                    내보내기
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <ConfirmDialog
        open={selectedMember !== null}
        title="해당 팀원을 모임에서"
        description="내보내시겠습니까?"
        cancelText="취소"
        confirmText="확인"
        confirmVariant="primary"
        onCancel={() => {
          setSelectedMember(null);
        }}
        onConfirm={handleRemoveMember}
      />
    </main>
  );
}
