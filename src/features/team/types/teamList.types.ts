export type TeamCardCategory = "문화" | "복지" | "교육" | "환경";

export type TeamCardItem = {
  id: number;
  title: string;
  description: string;
  location: string;
  currentMembers: number;
  maxMembers: number;
  date: string;
  deadline?: string;
  categories: TeamCardCategory[];
  imageUrl: string;
  createdAt: string;
  deadlineAt?: string;
  popularity: number;
};

export type TeamListSort = "latest" | "popular" | "deadline" | "default";
