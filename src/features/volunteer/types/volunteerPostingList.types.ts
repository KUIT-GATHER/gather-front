export type VolunteerPostingCardCategory = "문화" | "복지" | "교육" | "환경";

export type VolunteerPostingCardItem = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  deadline?: string;
  categories: VolunteerPostingCardCategory[];
  imageUrl: string;
  createdAt: string;
  deadlineAt?: string;
  popularity: number;
}; // 백엔드 api 와 동일하게 맞춰야함. (임시로 만든 타입이므로 추후 백엔드 api와 맞춰서 수정 필요)

export type VolunteerPostingListSort =
  | "latest"
  | "popular"
  | "deadline"
  | "default";
