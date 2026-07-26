import { useState } from "react";
import { useNavigate } from "react-router";

import type { MeetingHome } from "@/features/team/types/team.types";
import type { MeetingDetail } from "@/features/team/types/team.types";

import { SharedHomeContent } from "../shared/SharedHomeContent";

import { GuestBoard } from "./GuestBoard";
import { GuestHeader } from "./GuestHeader";
import { GuestJoinBar } from "./GuestJoinBar";
import { GuestTabs, type GuestTab } from "./GuestTabs";

type GuestDetailProps = {
  home: MeetingHome;
  detail: MeetingDetail;
};

function isJoinDisabled(home: MeetingHome) {
  return (
    home.status !== "RECRUITING" || home.currentMemberCount >= home.maxMember
  );
}

export function GuestDetail({ home, detail }: GuestDetailProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GuestTab>("home");

  return (
    <article className="min-h-dvh pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
      <GuestHeader title={home.name} onBack={() => navigate(-1)} />
      <GuestTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "home" ? (
        <SharedHomeContent home={home} detail={detail} />
      ) : (
        <GuestBoard home={home} />
      )}

      <GuestJoinBar
        disabled={isJoinDisabled(home)}
        meetingId={home.meetingId}
        meetingName={home.name}
      />
    </article>
  );
}
