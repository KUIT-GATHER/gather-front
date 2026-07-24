import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestDetail } from "./guest/GuestDetail";
import { TeammateDetail } from "./teammate/TeammateDetail";

type TeamDetailScreenProps = {
  home: MeetingHome;
};

export function TeamDetailScreen({ home }: TeamDetailScreenProps) {
  if (!home.member && !home.host) {
    return <GuestDetail home={home} />;
  }

  return (
    <TeammateDetail home={home} viewerRole={home.host ? "leader" : "member"} />
  );
}
