import CommunityPuzzle from "../assets/puzzles/community.svg";
import CommunitySelectedPuzzle from "../assets/puzzles/community-selected.svg";
import CulturePuzzle from "../assets/puzzles/culture.svg";
import CultureSelectedPuzzle from "../assets/puzzles/culture-selected.svg";
import EducationPuzzle from "../assets/puzzles/education.svg";
import EducationSelectedPuzzle from "../assets/puzzles/education-selected.svg";
import EnvironmentPuzzle from "../assets/puzzles/environment.svg";
import EnvironmentSelectedPuzzle from "../assets/puzzles/environment-selected.svg";
import GlobalPuzzle from "../assets/puzzles/global.svg";
import GlobalSelectedPuzzle from "../assets/puzzles/global-selected.svg";
import WelfarePuzzle from "../assets/puzzles/welfare.svg";
import WelfareSelectedPuzzle from "../assets/puzzles/welfare-selected.svg";

export type CategoryPuzzleAssets = {
  defaultSrc: string;
  selectedSrc: string;
};

const communityPuzzle: CategoryPuzzleAssets = {
  defaultSrc: CommunityPuzzle,
  selectedSrc: CommunitySelectedPuzzle,
};

const culturePuzzle: CategoryPuzzleAssets = {
  defaultSrc: CulturePuzzle,
  selectedSrc: CultureSelectedPuzzle,
};

const educationPuzzle: CategoryPuzzleAssets = {
  defaultSrc: EducationPuzzle,
  selectedSrc: EducationSelectedPuzzle,
};

const environmentPuzzle: CategoryPuzzleAssets = {
  defaultSrc: EnvironmentPuzzle,
  selectedSrc: EnvironmentSelectedPuzzle,
};

const globalPuzzle: CategoryPuzzleAssets = {
  defaultSrc: GlobalPuzzle,
  selectedSrc: GlobalSelectedPuzzle,
};

const welfarePuzzle: CategoryPuzzleAssets = {
  defaultSrc: WelfarePuzzle,
  selectedSrc: WelfareSelectedPuzzle,
};

const categoryPuzzleByCode: Record<string, CategoryPuzzleAssets> = {
  "0100": welfarePuzzle,
  "0200": communityPuzzle,
  "0300": welfarePuzzle,
  "0400": educationPuzzle,
  "0500": welfarePuzzle,
  "0600": communityPuzzle,
  "0700": culturePuzzle,
  "0800": environmentPuzzle,
  "0900": communityPuzzle,
  "1000": communityPuzzle,
  "1100": welfarePuzzle,
  "1200": environmentPuzzle,
  "1300": globalPuzzle,
  "1500": communityPuzzle,
  "1700": educationPuzzle,
  "1900": globalPuzzle,
};

const fallbackPuzzles: CategoryPuzzleAssets[] = [
  environmentPuzzle,
  educationPuzzle,
  culturePuzzle,
  communityPuzzle,
  welfarePuzzle,
  globalPuzzle,
];

function stableIndex(value: string) {
  return Array.from(value).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
}

export function getCategoryPuzzleAssets(
  categoryCode: string,
): CategoryPuzzleAssets {
  return (
    categoryPuzzleByCode[categoryCode] ??
    fallbackPuzzles[stableIndex(categoryCode) % fallbackPuzzles.length]
  );
}
