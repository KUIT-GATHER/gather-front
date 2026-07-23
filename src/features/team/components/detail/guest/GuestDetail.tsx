import type { MeetingHome } from "@/features/team/types/team.types";

import { SharedHeader } from "../shared/SharedHeader";
import { SharedHomeContent } from "../shared/SharedHomeContent";

type GuestDetailProps = {
  home: MeetingHome;
};

export function GuestDetail({ home }: GuestDetailProps) {
  return (
    <>
      <SharedHeader title={home.name} />
      <SharedHomeContent home={home} />
    </>
  );
}
