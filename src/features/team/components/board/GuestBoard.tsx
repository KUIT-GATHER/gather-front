import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestBoardAccessNotice } from "./GuestBoardAccessNotice";
import { SharedMeetingBoard } from "./SharedMeetingBoard";

type GuestBoardProps = {
  home: MeetingHome;
};

export function GuestBoard({ home }: GuestBoardProps) {
  return (
    <SharedMeetingBoard
      meetingId={home.meetingId}
      meetingName={home.name}
      notice={<GuestBoardAccessNotice />}
      availableTypes={["NOTICE", "REVIEW"]}
      emptyMessage="현재 작성된 활동 후기가 존재하지 않습니다"
    />
  );
}
