import type { MeetingHome } from "@/features/team/types/team.types";

type GuestBoardProps = {
  home: MeetingHome;
};

export function GuestBoard({ home }: GuestBoardProps) {
  return <section aria-label={`${home.name} 게시판`} />;
}
