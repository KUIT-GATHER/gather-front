import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router";

import { teamQueries } from "@/features/team/api/team.queries";

import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";
import { cn } from "@/shared/lib/cn";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import PageHeader from "@/shared/ui/PageHeader";
import { ChevronDown, ChevronUp } from "lucide-react";

type ApplicantType = "MEMBER" | "EXTERNAL";
type AttendanceStatus = "UNSET" | "PRESENT" | "ABSENT";

type ActivityApplicant = {
  applicantId: number;
  userId: number;
  nickname: string;
  applicantType: ApplicantType;
  phone: string;
  birthDate: string;
  region: string;
  interests: string[];
  attendanceStatus: AttendanceStatus;
};

type PendingDialog =
  | {
      type: "fix";
    }
  | {
      type: "reject";
      applicant: ActivityApplicant;
    };

const DEV_APPLICANTS: ActivityApplicant[] = [
  {
    applicantId: 1,
    userId: 101,
    nickname: "박서준",
    applicantType: "EXTERNAL",
    phone: "010-1234-5678",
    birthDate: "2005.11.24",
    region: "서울 강남구",
    interests: ["복지", "환경", "교육"],
    attendanceStatus: "UNSET",
  },
  {
    applicantId: 2,
    userId: 102,
    nickname: "최민호",
    applicantType: "MEMBER",
    phone: "010-9876-5432",
    birthDate: "2004.08.12",
    region: "서울 광진구",
    interests: ["교육", "문화"],
    attendanceStatus: "UNSET",
  },
];

export function TeamActivityApplicantsPage() {
  const navigate = useNavigate();
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const { home, isHost } = useTeamDetailContext();

  const postId = Number(postIdParam);
  const hasValidPostId = Number.isInteger(postId) && postId > 0;

  const recruitQuery = useQuery({
    ...teamQueries.recruit(home.meetingId, postId),
    enabled: isHost && hasValidPostId,
  });

  const [applicants, setApplicants] = useState<ActivityApplicant[]>(() =>
    import.meta.env.DEV ? DEV_APPLICANTS : [],
  );
  const [participantsConfirmed, setParticipantsConfirmed] = useState(false);
  const [expandedApplicantId, setExpandedApplicantId] = useState<number | null>(
    null,
  );
  const [pendingDialog, setPendingDialog] = useState<PendingDialog | null>(
    null,
  );

  if (!isHost) {
    return <Navigate to={`/teams/${home.meetingId}`} replace />;
  }

  if (!hasValidPostId) {
    return (
      <Navigate to={`/teams/${home.meetingId}/settings/activities`} replace />
    );
  }

  const activityTitle =
    recruitQuery.data?.title ??
    (recruitQuery.isLoading ? "불러오는 중" : "봉사 신청자 관리");

  const handleDialogConfirm = () => {
    if (!pendingDialog) return;

    if (pendingDialog.type === "fix") {
      setParticipantsConfirmed(true);
    } else {
      setApplicants((current) =>
        current.filter(
          (applicant) =>
            applicant.applicantId !== pendingDialog.applicant.applicantId,
        ),
      );

      if (expandedApplicantId === pendingDialog.applicant.applicantId) {
        setExpandedApplicantId(null);
      }
    }

    setPendingDialog(null);
  };

  const updateAttendance = (
    applicantId: number,
    attendanceStatus: AttendanceStatus,
  ) => {
    setApplicants((current) =>
      current.map((applicant) =>
        applicant.applicantId === applicantId
          ? {
              ...applicant,
              attendanceStatus,
            }
          : applicant,
      ),
    );
  };

  return (
    <main className="min-h-dvh bg-bg px-5.5">
      <PageHeader
        title={activityTitle}
        onBack={() => navigate(-1)}
        rightAction={
          <span className="rounded-lg bg-[#6D6D6D] px-3 py-1.5 text-[12px] font-medium text-white">
            팀장
          </span>
        }
        sticky
      />

      <section className="pb-28 pt-6">
        {!participantsConfirmed && applicants.length > 0 ? (
          <button
            type="button"
            className="mb-5 h-12 w-full rounded-xl bg-button text-[15px] font-medium text-white"
            onClick={() => {
              setPendingDialog({
                type: "fix",
              });
            }}
          >
            이 인원 확정하기
          </button>
        ) : null}

        {applicants.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <p className="text-[16px] font-medium text-text">
              봉사 신청자가 없어요
            </p>

            <p className="mt-2 text-[14px] text-text-gray-200">
              신청자가 생기면 이곳에 표시돼요.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {applicants.map((applicant) => {
              const expanded = expandedApplicantId === applicant.applicantId;

              return (
                <li
                  key={applicant.applicantId}
                  className="rounded-xl border border-stroke bg-white p-3"
                >
                  <div className="flex min-h-8 items-center justify-between gap-3">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none"
                      onClick={() => {
                        setExpandedApplicantId((current) =>
                          current === applicant.applicantId
                            ? null
                            : applicant.applicantId,
                        );
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-stroke text-[11px] font-medium text-text"
                      >
                        {applicant.nickname.slice(0, 1)}
                      </span>

                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-[14px] font-medium text-text">
                          {applicant.nickname}
                        </span>

                        {expanded ? (
                          <ChevronUp
                            aria-hidden="true"
                            className="size-4 shrink-0 text-text-gray-300"
                          />
                        ) : (
                          <ChevronDown
                            aria-hidden="true"
                            className="size-4 shrink-0 text-text-gray-300"
                          />
                        )}
                      </span>
                    </button>

                    {!participantsConfirmed ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md border border-stroke px-2 py-1 text-[11px] font-medium text-text-gray-300">
                          {applicant.applicantType === "MEMBER"
                            ? "팀원"
                            : "외부"}
                        </span>

                        <button
                          type="button"
                          className="rounded-md border border-point-red px-2 py-1 text-[11px] font-medium text-point-red"
                          onClick={() => {
                            setPendingDialog({
                              type: "reject",
                              applicant,
                            });
                          }}
                        >
                          반려
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          aria-pressed={
                            applicant.attendanceStatus === "PRESENT"
                          }
                          className={cn(
                            "rounded-md border px-2 py-1 text-[11px] font-medium",
                            applicant.attendanceStatus === "PRESENT"
                              ? "border-button bg-button text-white"
                              : "border-button bg-white text-button",
                          )}
                          onClick={() => {
                            updateAttendance(applicant.applicantId, "PRESENT");
                          }}
                        >
                          출석
                        </button>

                        <button
                          type="button"
                          aria-pressed={applicant.attendanceStatus === "ABSENT"}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[11px] font-medium",
                            applicant.attendanceStatus === "ABSENT"
                              ? "border-point-red bg-point-red text-white"
                              : "border-point-red bg-white text-point-red",
                          )}
                          onClick={() => {
                            updateAttendance(applicant.applicantId, "ABSENT");
                          }}
                        >
                          불참
                        </button>
                      </div>
                    )}
                  </div>

                  {expanded ? (
                    <div className="mt-3 rounded-xl bg-[#F3FAF5] p-3">
                      <h2 className="mb-3 text-[13px] font-semibold text-text">
                        기본 정보
                      </h2>

                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <dt className="text-[11px] text-text-gray-200">
                            전화번호
                          </dt>
                          <dd className="mt-1 text-[12px] text-text">
                            {applicant.phone}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-[11px] text-text-gray-200">
                            생년월일
                          </dt>
                          <dd className="mt-1 text-[12px] text-text">
                            {applicant.birthDate}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-[11px] text-text-gray-200">
                            지역
                          </dt>
                          <dd className="mt-1 text-[12px] text-text">
                            {applicant.region}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-[11px] text-text-gray-200">
                            관심 분야
                          </dt>
                          <dd className="mt-1 text-[12px] text-text">
                            {applicant.interests.join(", ")}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={pendingDialog !== null}
        title={
          pendingDialog?.type === "fix" ? "현재 신청 인원으로" : "해당 신청자를"
        }
        description={
          pendingDialog?.type === "fix"
            ? "참가자로 확정하시겠습니까?"
            : "봉사 신청에서 반려하시겠습니까?"
        }
        confirmText={pendingDialog?.type === "fix" ? "확정" : "반려"}
        confirmVariant={pendingDialog?.type === "fix" ? "primary" : "danger"}
        onCancel={() => {
          setPendingDialog(null);
        }}
        onConfirm={handleDialogConfirm}
      />
    </main>
  );
}
