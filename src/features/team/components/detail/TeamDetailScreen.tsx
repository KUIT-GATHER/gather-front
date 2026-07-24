import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

import { GuestDetail } from "./guest/GuestDetail";
import { TeammateDetail } from "./teammate/TeammateDetail";

type TeamDetailScreenProps = {
  home: MeetingHome;
  detail: MeetingDetail;
};

export function TeamDetailScreen({ home, detail }: TeamDetailScreenProps) {
  if (!home.member && !home.host) {
    return <GuestDetail home={home} detail={detail} />;
  }

  return (
    <TeammateDetail
      home={home}
      detail={detail}
      viewerRole={home.host ? "leader" : "member"}
    />
  );
}
