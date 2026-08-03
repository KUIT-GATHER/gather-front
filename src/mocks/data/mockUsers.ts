import type { PostingCategory } from "@/features/category/types/postingCategory.types";

export type MockUser = {
  id: number;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  email: string;
  password: string;
  nickname: string;
  introduction?: string | null;
  activityRegionId: number;
  interestCategories: PostingCategory[];
};

export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: "동진",
    birthDate: "2000-01-01",
    gender: "MALE",
    phoneNumber: "01012345678",
    email: "test@example.com",
    password: "test1234",
    nickname: "가더",
    introduction: "함께 봉사하는 걸 좋아해요.",
    activityRegionId: 201,
    interestCategories: ["ENVIRONMENT", "COMMUNITY"],
  },
];

export function getMockUserById(userId: number) {
  return mockUsers.find((user) => user.id === userId) ?? null;
}
