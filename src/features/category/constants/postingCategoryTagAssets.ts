import CommunityIcon from "@/shared/assets/category-tags/community.svg";
import CultureIcon from "@/shared/assets/category-tags/culture.svg";
import EducationIcon from "@/shared/assets/category-tags/education.svg";
import EnvironmentIcon from "@/shared/assets/category-tags/environment.svg";
import OverseasIcon from "@/shared/assets/category-tags/overseas.svg";
import WelfareIcon from "@/shared/assets/category-tags/welfare.svg";

import type { PostingCategory } from "../types/postingCategory.types";

export const POSTING_CATEGORY_TAG_ICON: Record<PostingCategory, string> = {
  ENVIRONMENT: EnvironmentIcon,
  EDUCATION: EducationIcon,
  CULTURE: CultureIcon,
  COMMUNITY: CommunityIcon,
  WELFARE: WelfareIcon,
  OVERSEAS: OverseasIcon,
};

export const FLIPPED_POSTING_CATEGORY_TAGS: readonly PostingCategory[] = [
  "ENVIRONMENT",
  "CULTURE",
  "COMMUNITY",
  "OVERSEAS",
];
