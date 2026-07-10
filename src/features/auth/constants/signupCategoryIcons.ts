import CommunityPuzzleIcon from "@/assets/icons/CommunityPuzzleIcon.svg";
import CulturePuzzleIcon from "@/assets/icons/CulturePuzzleIcon.svg";
import EducationPuzzleIcon from "@/assets/icons/EducationPuzzleIcon.svg";
import EnvironmentPuzzleIcon from "@/assets/icons/EnvironmentPuzzleIcon.svg";
import GlobalPuzzleIcon from "@/assets/icons/GlobalPuzzleIcon.svg";
import WelfarePuzzleIcon from "@/assets/icons/WelfarePuzzleIcon.svg";

const categoryIconByCode: Record<string, string> = {
  "0100": WelfarePuzzleIcon,
  "0200": CommunityPuzzleIcon,
  "0300": WelfarePuzzleIcon,
  "0400": EducationPuzzleIcon,
  "0500": WelfarePuzzleIcon,
  "0600": CommunityPuzzleIcon,
  "0700": CulturePuzzleIcon,
  "0800": EnvironmentPuzzleIcon,
  "0900": CommunityPuzzleIcon,
  "1000": CommunityPuzzleIcon,
  "1100": WelfarePuzzleIcon,
  "1200": EnvironmentPuzzleIcon,
  "1300": GlobalPuzzleIcon,
  "1500": CommunityPuzzleIcon,
  "1700": EducationPuzzleIcon,
  "1900": GlobalPuzzleIcon,
};

const fallbackIcons = [
  EnvironmentPuzzleIcon,
  EducationPuzzleIcon,
  CulturePuzzleIcon,
  CommunityPuzzleIcon,
  WelfarePuzzleIcon,
  GlobalPuzzleIcon,
];

function stableIndex(value: string) {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getSignupCategoryIcon(code: string) {
  return (
    categoryIconByCode[code] ??
    fallbackIcons[stableIndex(code) % fallbackIcons.length]
  );
}
