import type { ReactNode } from "react";

import type { MeetingHome } from "@/features/team/types/team.types";

import { GuestDetail } from "./guest/GuestDetail";
import { TeammateDetail } from "./teammate/TeammateDetail";

type TeamDetailScreenProps = {
  home: MeetingHome;
  isJoined: boolean;
  isHost: boolean;
  children: ReactNode;
};

export function TeamDetailScreen({
  home,
  isJoined,
  isHost,
  children,
}: TeamDetailScreenProps) {
  if (!isJoined) {
    return <GuestDetail home={home}>{children}</GuestDetail>;
  }

  return (
    <TeammateDetail home={home} viewerRole={isHost ? "leader" : "member"}>
      {children}
    </TeammateDetail>
  );
}
