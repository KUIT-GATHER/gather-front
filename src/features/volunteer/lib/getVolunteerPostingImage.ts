import CommunityPuzzle from "@/features/category/assets/puzzles/community.svg";
import CulturePuzzle from "@/features/category/assets/puzzles/culture.svg";
import EducationPuzzle from "@/features/category/assets/puzzles/education.svg";
import EnvironmentPuzzle from "@/features/category/assets/puzzles/environment.svg";
import OverseasPuzzle from "@/features/category/assets/puzzles/global.svg";
import WelfarePuzzle from "@/features/category/assets/puzzles/welfare.svg";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

import fallbackImage from "@/assets/icons/Temp-volunteer-posting.svg";

const VOLUNTEER_POSTING_IMAGE_BY_CATEGORY: Record<PostingCategory, string> = {
  ENVIRONMENT: EnvironmentPuzzle,
  EDUCATION: EducationPuzzle,
  CULTURE: CulturePuzzle,
  COMMUNITY: CommunityPuzzle,
  WELFARE: WelfarePuzzle,
  OVERSEAS: OverseasPuzzle,
};

export function getVolunteerPostingImage(category?: PostingCategory | null) {
  if (!category) {
    return fallbackImage;
  }

  return VOLUNTEER_POSTING_IMAGE_BY_CATEGORY[category] ?? fallbackImage;
}
