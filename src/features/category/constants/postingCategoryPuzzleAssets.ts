import CommunityPuzzle from "../assets/puzzles/community.svg";
import CommunitySelectedPuzzle from "../assets/puzzles/community-selected.svg";
import CulturePuzzle from "../assets/puzzles/culture.svg";
import CultureSelectedPuzzle from "../assets/puzzles/culture-selected.svg";
import EducationPuzzle from "../assets/puzzles/education.svg";
import EducationSelectedPuzzle from "../assets/puzzles/education-selected.svg";
import EnvironmentPuzzle from "../assets/puzzles/environment.svg";
import EnvironmentSelectedPuzzle from "../assets/puzzles/environment-selected.svg";
import OverseasPuzzle from "../assets/puzzles/global.svg";
import OverseasSelectedPuzzle from "../assets/puzzles/global-selected.svg";
import WelfarePuzzle from "../assets/puzzles/welfare.svg";
import WelfareSelectedPuzzle from "../assets/puzzles/welfare-selected.svg";

import type { PostingCategory } from "../types/postingCategory.types";

export type PostingCategoryPuzzleAssets = {
  defaultSrc: string;
  selectedSrc: string;
};

export const POSTING_CATEGORY_PUZZLE_ASSETS: Record<
  PostingCategory,
  PostingCategoryPuzzleAssets
> = {
  ENVIRONMENT: {
    defaultSrc: EnvironmentPuzzle,
    selectedSrc: EnvironmentSelectedPuzzle,
  },
  EDUCATION: {
    defaultSrc: EducationPuzzle,
    selectedSrc: EducationSelectedPuzzle,
  },
  CULTURE: {
    defaultSrc: CulturePuzzle,
    selectedSrc: CultureSelectedPuzzle,
  },
  COMMUNITY: {
    defaultSrc: CommunityPuzzle,
    selectedSrc: CommunitySelectedPuzzle,
  },
  WELFARE: {
    defaultSrc: WelfarePuzzle,
    selectedSrc: WelfareSelectedPuzzle,
  },
  OVERSEAS: {
    defaultSrc: OverseasPuzzle,
    selectedSrc: OverseasSelectedPuzzle,
  },
};
