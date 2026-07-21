import type { PostingCategory } from "@/features/category/types/postingCategory.types";

import fallbackImage from "@/assets/icons/Temp-volunteer-posting.svg";
import CommunityImage01 from "@/features/volunteer/assets/posting-images/community/community-01.png";
import CommunityImage02 from "@/features/volunteer/assets/posting-images/community/community-02.png";
import CommunityImage03 from "@/features/volunteer/assets/posting-images/community/community-03.png";
import CultureImage01 from "@/features/volunteer/assets/posting-images/culture/culture-01.png";
import CultureImage02 from "@/features/volunteer/assets/posting-images/culture/culture-02.png";
import CultureImage03 from "@/features/volunteer/assets/posting-images/culture/culture-03.png";
import EducationImage01 from "@/features/volunteer/assets/posting-images/education/education-01.png";
import EducationImage02 from "@/features/volunteer/assets/posting-images/education/education-02.png";
import EducationImage03 from "@/features/volunteer/assets/posting-images/education/education-03.png";
import EnvironmentImage01 from "@/features/volunteer/assets/posting-images/environment/environment-01.png";
import EnvironmentImage02 from "@/features/volunteer/assets/posting-images/environment/environment-02.png";
import EnvironmentImage03 from "@/features/volunteer/assets/posting-images/environment/environment-03.png";
import OverseasImage01 from "@/features/volunteer/assets/posting-images/overseas/overseas-01.png";
import OverseasImage02 from "@/features/volunteer/assets/posting-images/overseas/overseas-02.png";
import OverseasImage03 from "@/features/volunteer/assets/posting-images/overseas/overseas-03.png";
import WelfareImage01 from "@/features/volunteer/assets/posting-images/welfare/welfare-01.png";
import WelfareImage02 from "@/features/volunteer/assets/posting-images/welfare/welfare-02.png";
import WelfareImage03 from "@/features/volunteer/assets/posting-images/welfare/welfare-03.png";

const VOLUNTEER_POSTING_IMAGES_BY_CATEGORY = {
  ENVIRONMENT: [EnvironmentImage01, EnvironmentImage02, EnvironmentImage03],
  EDUCATION: [EducationImage01, EducationImage02, EducationImage03],
  CULTURE: [CultureImage01, CultureImage02, CultureImage03],
  COMMUNITY: [CommunityImage01, CommunityImage02, CommunityImage03],
  WELFARE: [WelfareImage01, WelfareImage02, WelfareImage03],
  OVERSEAS: [OverseasImage01, OverseasImage02, OverseasImage03],
} as const satisfies Record<PostingCategory, readonly string[]>;

export function getVolunteerPostingImage(
  category?: PostingCategory | null,
  postingId?: number | null,
): string {
  if (!category || postingId == null) {
    return fallbackImage;
  }

  const images = VOLUNTEER_POSTING_IMAGES_BY_CATEGORY[category];

  if (!images?.length) {
    return fallbackImage;
  }

  const imageIndex = Math.abs(postingId) % images.length;

  return images[imageIndex] ?? fallbackImage;
}
