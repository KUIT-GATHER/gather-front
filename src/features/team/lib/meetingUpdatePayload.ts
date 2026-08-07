import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type { MeetingUpdateRequest } from "@/features/team/types/team.types";

type MeetingUpdateFields = Omit<
  MeetingUpdateRequest,
  "categories" | "regionId" | "timeRecognized"
>;

type FreeMeetingUpdateInput = MeetingUpdateFields & {
  basedOnPosting: false;
  categories: PostingCategory[];
  regionId: number;
};

type PostingMeetingUpdateInput = MeetingUpdateFields & {
  basedOnPosting: true;
  timeRecognized: boolean;
};

export function buildMeetingUpdatePayload(
  input: FreeMeetingUpdateInput | PostingMeetingUpdateInput,
): MeetingUpdateRequest {
  const common = {
    name: input.name,
    description: input.description,
    maxMember: input.maxMember,
    deadline: input.deadline,
    participationCondition: input.participationCondition,
  };

  return input.basedOnPosting
    ? {
        ...common,
        categories: null,
        regionId: null,
        timeRecognized: input.timeRecognized,
      }
    : {
        ...common,
        categories: input.categories,
        regionId: input.regionId,
        timeRecognized: false,
      };
}
