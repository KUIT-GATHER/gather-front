import preview from "../../../../.storybook/preview";
import { fn } from "storybook/test";

import fallbackImage from "@/assets/icons/Temp-volunteer-posting.svg";
import type { PostingCategory } from "@/features/category/types/postingCategory.types";

import { ActivityListCard } from "./ActivityListCard";

const baseActivity = {
  imageSrc: fallbackImage,
  title: "우리 동네 책읽기 봉사",
  description: "아이들과 함께 책을 읽고 이야기를 나누는 활동입니다.",
  metadata: ["서울 마포구", "2026. 08. 24(월)"],
  dDay: "D-7",
  categories: ["EDUCATION"] as PostingCategory[],
  onClick: fn(),
};

const meta = preview.meta({
  title: "Features/Activity/ActivityListCard",
  component: ActivityListCard,
  parameters: {
    layout: "padded",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  args: baseActivity,
  argTypes: {
    image: { control: false },
    imageSrc: { control: false },
    categories: { control: false },
    metadata: { control: false },
    onClick: { control: false },
  },
});

export const Default = meta.story();

export const UrgentDDay = meta.story({
  args: {
    title: "이번 주말 도시 숲 가꾸기",
    description: "도시 숲 주변을 정리하고 나무를 돌보는 활동입니다.",
    dDay: "D-1",
    categories: ["ENVIRONMENT"],
  },
});

export const LongTitleAndDescription = meta.story({
  args: {
    title:
      "처음 참여하는 사람도 함께할 수 있는 우리 동네 어린이 도서관 책 정리와 낭독 봉사",
    description:
      "도서관에 도착한 책을 분류하고 아이들과 책을 읽으며 긴 설명도 말줄임 처리되는지 확인합니다.",
    metadata: ["서울특별시 마포구 성산동", "2026. 08. 30(일)"],
  },
});

export const MultipleCategories = meta.story({
  args: {
    title: "지역 문화 축제 운영 지원",
    description: "축제 방문객 안내와 체험 부스 운영을 도와요.",
    categories: ["CULTURE", "COMMUNITY", "EDUCATION"],
  },
});

export const MissingOptionalMetadata = meta.story({
  args: {
    title: "따뜻한 마음 나누기",
    description: null,
    metadata: [],
    dDay: null,
    categories: ["WELFARE"],
  },
});
