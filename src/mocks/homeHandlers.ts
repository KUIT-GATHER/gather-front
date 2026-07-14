import { HttpResponse, http } from "msw";

import postings from "./data/postings.json";
import teams from "./data/teams.json";

import type { VolunteerPostingListItem } from "@/features/volunteer/types/volunteer.types";

function toVolunteerPostingListItem(
  posting: (typeof postings.data)[number],
): VolunteerPostingListItem {
  return {
    id: posting.id,
    title: posting.title,
    status: posting.status as VolunteerPostingListItem["status"],
    recruitOrg: posting.recruitOrg,
    actStartDate: posting.actStartDate,
    actEndDate: posting.actEndDate,
    actPlace: posting.actPlace,
    recruitCount: posting.recruitCount,
    applicantCount: posting.applicantCount,
    regionId: posting.regionId,
    regionName: posting.regionName,
    categoryId: posting.categoryId,
    categoryName: posting.categoryName,
  };
}

export const homeHandlers = [
  http.get("*/api/v1/home", () => {
    return HttpResponse.json({
      success: true,
      data: {
        recommendedVolunteers: postings.data
          .slice(0, 5)
          .map(toVolunteerPostingListItem),
        recommendedTeams: teams.data.slice(0, 5),
      },
      error: null,
    });
  }),
];
