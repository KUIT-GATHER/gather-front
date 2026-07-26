import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestHeader } from "./GuestHeader";
import { GuestJoinBar } from "./GuestJoinBar";
import { GuestTabs } from "./GuestTabs";

type GuestDetailProps = {
  home: MeetingHome;
  children: ReactNode;
};

function isJoinDisabled(home: MeetingHome) {
  return (
    home.status !== "RECRUITING" || home.currentMemberCount >= home.maxMember
  );
}

export function GuestDetail({ home, children }: GuestDetailProps) {
  const navigate = useNavigate();

  return (
    <article className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
      <GuestHeader title={home.name} onBack={() => navigate(-1)} />
      <GuestTabs meetingId={home.meetingId} />

      {children}

      <GuestJoinBar
        disabled={isJoinDisabled(home)}
        meetingId={home.meetingId}
        meetingName={home.name}
      />
    </article>
  );
}
