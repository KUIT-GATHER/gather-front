import type { PostingCategory } from "../types/postingCategory.types";

export const POSTING_CATEGORY_BADGE_STYLE: Record<PostingCategory, string> = {
  ENVIRONMENT: "border-[#82D3CA] bg-[#F1FFFD]",
  EDUCATION: "border-[#828ED2] bg-[#EEF1FF]",
  CULTURE: "border-[#FADE9E] bg-[#FFFBF1]",
  COMMUNITY: "border-[#DCECDF] bg-[#F4FFF6]",
  WELFARE: "border-[#D197D1] bg-[#FFF3FF]",
  OVERSEAS: "border-[#A6CCF4] bg-[#F1F8FF]",
};

export const POSTING_CATEGORY_TILE_STYLE: Record<PostingCategory, string> = {
  ENVIRONMENT: "border-[#9ED6AE] bg-[#F0FFF4] text-[#4B9660]",
  EDUCATION: "border-[#9FC4F5] bg-[#F1F7FF] text-[#4D81C4]",
  CULTURE: "border-[#F2D28D] bg-[#FFF9EA] text-[#B98926]",
  COMMUNITY: "border-[#8FD8CF] bg-[#EFFFFC] text-[#4A9E94]",
  WELFARE: "border-[#E4A6E7] bg-[#FFF2FF] text-[#B05AB6]",
  OVERSEAS: "border-[#C8B5F5] bg-[#F7F3FF] text-[#7655B8]",
};
