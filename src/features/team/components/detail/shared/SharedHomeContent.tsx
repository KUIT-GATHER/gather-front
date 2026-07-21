import type { MeetingHome } from "@/features/team/types/team.types";

type SharedHomeContentProps = {
  home: MeetingHome;
};

export function SharedHomeContent({ home }: SharedHomeContentProps) {
  return <section>{home.description}</section>;
}
