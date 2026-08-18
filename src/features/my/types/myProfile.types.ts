import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type { Region } from "@/features/region/types/region.types";
import type { LoginType } from "@/shared/types/user.types";

export type MyPageHome = {
  nickname: string;
  profileImageUrl: string | null;
  birthDate: string;
  activityRegion: Region | null;
  hasBookmark: boolean;
};

export type MyProfile = {
  id: number;
  name: string;
  nickname: string;
  introduction: string | null;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  loginType: LoginType;
  activityRegion: Region | null;
  interestCategories: PostingCategory[];
};

export type UpdateMyProfileRequest = {
  name: string;
  nickname: string;
  introduction: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  activityRegionId: number;
  interestCategories: PostingCategory[];
};
