import { fetchClient } from "@/shared/api/fetchClient";

import type { PostingTeam, TeamStatus } from "@/features/team/types/team.types";

const publicOptions = {
  skipAuth: true,
  withCredentials: false,
} as const;

type PostingTeamApiItem = Partial<PostingTeam> & {
  posting_id?: number;
  recruit_count?: number;
  applicant_count?: number;
  status?: TeamStatus | "OPEN";
  category?: {
    name?: string;
  };
};

function normalizeTeamStatus(status: PostingTeamApiItem["status"]): TeamStatus {
  if (
    status === "RECRUITING" ||
    status === "CLOSED" ||
    status === "COMPLETED"
  ) {
    return status;
  }

  return "OPEN";
}

function normalizePostingTeam(team: PostingTeamApiItem): PostingTeam {
  return {
    id: team.id ?? 0,
    postingId: team.postingId ?? team.posting_id ?? 0,
    title: team.title ?? "",
    status: normalizeTeamStatus(team.status),
    recruitCount: team.recruitCount ?? team.recruit_count ?? 0,
    applicantCount: team.applicantCount ?? team.applicant_count ?? 0,
    categoryName: team.categoryName ?? team.category?.name ?? "",
  };
}

export function getPostingTeams(postingId: number) {
  return fetchClient<PostingTeamApiItem[]>(
    `/api/v1/postings/${postingId}/teams`,
    publicOptions,
  ).then((teams) => teams.map(normalizePostingTeam));
}
