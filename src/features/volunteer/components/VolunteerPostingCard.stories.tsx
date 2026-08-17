import { fn } from "storybook/test";

import type { Meta, StoryObj } from "@storybook/react-vite";

import type { VolunteerPostingListItem } from "@/features/volunteer/types/volunteer.types";

import { VolunteerPostingCard } from "./VolunteerPostingCard";

function getDateAfterToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) =>
      index === 0 ? String(value) : String(value).padStart(2, "0"),
    )
    .join("-");
}

const basePosting: VolunteerPostingListItem = {
  id: 101,
  title: "우리 동네 책읽기 봉사",
  status: "RECRUITING",
  recruitOrg: "마포구립도서관",
  actStartDate: getDateAfterToday(7),
  actEndDate: getDateAfterToday(7),
  actPlace: "마포구 성산동",
  recruitCount: 12,
  applicantCount: 5,
  regionId: 1,
  regionName: "서울 마포구",
  category: "EDUCATION",
  noticeEndDate: getDateAfterToday(7),
};

const meta = {
  title: "Features/Volunteer/VolunteerPostingCard",
  component: VolunteerPostingCard,
  parameters: {
    layout: "padded",
  },
  globals: {
    viewport: { value: "gatherMobile", isRotated: false },
  },
  args: {
    posting: basePosting,
    onClick: fn(),
  },
  argTypes: {
    posting: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof VolunteerPostingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

export const Compact: Story = {
  args: {
    variant: "compact",
  },
};

export const LongTitle: Story = {
  args: {
    posting: {
      ...basePosting,
      title:
        "처음 참여해도 부담 없이 함께할 수 있는 우리 동네 어린이 도서관 책읽기 봉사",
    },
  },
};

export const MissingOptionalData: Story = {
  args: {
    posting: {
      ...basePosting,
      recruitOrg: null,
      actStartDate: null,
      actEndDate: null,
      actPlace: null,
      recruitCount: null,
      applicantCount: null,
      regionName: null,
      noticeEndDate: null,
    },
  },
};

export const UrgentRecruitment: Story = {
  args: {
    posting: {
      ...basePosting,
      id: 102,
      title: "이번 주말 도시 숲 가꾸기",
      category: "ENVIRONMENT",
      noticeEndDate: getDateAfterToday(1),
    },
  },
};
