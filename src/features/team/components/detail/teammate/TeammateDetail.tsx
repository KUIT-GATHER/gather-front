import { useState } from "react";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import type {
  MeetingHome,
  MeetingDetail,
  TeammateViewerRole,
} from "@/features/team/types/team.types";

import { SharedMeetingBoard } from "../shared/SharedMeetingBoard";
import { SharedHomeContent } from "../shared/SharedHomeContent";

import { TeammateHeader } from "./TeammateHeader";
import { TeammateTabs, type TeammateTab } from "./TeammateTabs";

type TeammateDetailProps = {
  home: MeetingHome;
  detail: MeetingDetail;
  viewerRole: TeammateViewerRole;
};

export function TeammateDetail({
  home,
  detail,
  viewerRole,
}: TeammateDetailProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TeammateTab>("home");
  const tabs: TeammateTab[] = ["home", "posts", "myActivity"];

  return (
    <article className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <TeammateHeader
        title={home.name}
        viewerRole={viewerRole}
        onBack={() => navigate(-1)}
      />
      <TeammateTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "home" ? (
        <SharedHomeContent home={home} detail={detail} />
      ) : null}

      {activeTab === "posts" ? (
        <SharedMeetingBoard
          meetingId={home.meetingId}
          meetingName={home.name}
        />
      ) : null}

      {activeTab === "myActivity" ? (
        <section className="px-5.5 py-4">
          <p className="flex min-h-75 items-center justify-center text-center text-[18px] leading-5 font-medium text-text-gray-400">
            현재 작성된 활동이 존재하지 않습니다
          </p>
        </section>
      ) : null}

      <MobileBottomNavigation />
    </article>
  );
}
