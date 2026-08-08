import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import type { RecruitParticipantSummary } from "@/features/team/types/meetingRecruit.types";
import { cn } from "@/shared/lib/cn";

type RecruitParticipantCardProps = {
  participant: RecruitParticipantSummary;
  expanded: boolean;
  showReject: boolean;
  showAttendance: boolean;
  attendanceDisabled: boolean;
  attendancePending: boolean;
  rejectPending: boolean;
  children?: ReactNode;
  onToggle: () => void;
  onReject: () => void;
  onAttendanceChange: (status: "PRESENT" | "ABSENT") => void;
};

const compactActionClassName = cn(
  "inline-flex h-6 shrink-0 items-center justify-center rounded-lg px-3",
  "font-sans text-body-14 whitespace-nowrap",
  "transition focus:outline-none focus-visible:ring-2",
  "disabled:cursor-not-allowed disabled:opacity-40",
);

export function RecruitParticipantCard({
  participant,
  expanded,
  showReject,
  showAttendance,
  attendanceDisabled,
  attendancePending,
  rejectPending,
  children,
  onToggle,
  onReject,
  onAttendanceChange,
}: RecruitParticipantCardProps) {
  const detailId = `recruit-participant-${participant.participationId}-detail`;
  const isPresent = participant.attendanceStatus === "PRESENT";
  const isAbsent = participant.attendanceStatus === "ABSENT";

  return (
    <li className="overflow-hidden rounded-xl border border-stroke bg-white font-sans">
      <div className="flex h-17 items-center gap-2 px-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={detailId}
          className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
          onClick={onToggle}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-stroke text-body-14 text-text">
            {participant.nickname.slice(0, 1)}
          </span>

          <span className="flex min-w-0 items-center gap-1">
            <span className="truncate text-base font-medium leading-5 text-text">
              {participant.nickname}
            </span>

            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-text-gray-300 transition",
                expanded && "rotate-180",
              )}
            />
          </span>
        </button>

        {!showAttendance ? (
          <span className="flex h-6 shrink-0 items-center border  border-[#5E5E5D] bg-white text-[12px] rounded-lg px-3 text-[#5E5E5D]">
            {participant.applicantType === "MEMBER" ? "팀원" : "외부"}
          </span>
        ) : null}

        {showReject ? (
          <button
            type="button"
            className={cn(
              compactActionClassName,
              "border border-[#F76073] bg-[#FAEEEE] w-12 text-[12px] hover:bg-[#F76073] hover:text-white text-point-red focus-visible:ring-point-red/40",
            )}
            disabled={rejectPending}
            onClick={onReject}
          >
            반려
          </button>
        ) : null}

        {showAttendance ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-pressed={isPresent}
              disabled={attendanceDisabled || attendancePending}
              className={cn(
                compactActionClassName,
                "border border-[#00C77B] transition w-12 text-[12px] hover:bg-[#00C77B] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40 disabled:cursor-not-allowed disabled:opacity-40",
                isPresent ? "bg-button text-white" : "text-button",
              )}
              onClick={() => onAttendanceChange("PRESENT")}
            >
              참석
            </button>
            <button
              type="button"
              aria-pressed={isAbsent}
              disabled={attendanceDisabled || attendancePending}
              className={cn(
                compactActionClassName,
                "border border-[#F76073] transition w-12 text-[12px] hover:bg-[#F76073] hover:text-white font-regular focus:outline-none focus-visible:ring-2 focus-visible:ring-point-red/40 disabled:cursor-not-allowed disabled:opacity-40",
                isAbsent ? "bg-point-red text-white" : "text-point-red",
              )}
              onClick={() => onAttendanceChange("ABSENT")}
            >
              불참
            </button>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div
          id={detailId}
          className="mx-3 mb-3 rounded-xl bg-point-green/10 p-3"
        >
          {children}
        </div>
      ) : null}
    </li>
  );
}
