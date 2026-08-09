import { createContext } from "react";

import type {
  MeetingDetail,
  MeetingHome,
} from "@/features/team/types/team.types";

export type TeamDetailContextValue = {
  meetingId: number;
  home: MeetingHome;
  detail: MeetingDetail;
  imageUrls: readonly string[];
  authInitialized: boolean;
  isAuthenticated: boolean;
  isJoined: boolean;
  isHost: boolean;
};

export const TeamDetailContext = createContext<TeamDetailContextValue | null>(
  null,
);
