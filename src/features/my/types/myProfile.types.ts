import type { PostingCategory } from "@/features/category/types/postingCategory.types";
import type { Region } from "@/features/region/types/region.types";

export type MyPageHome = {
  nickname: string;
  profileImageUrl: string | null;
  birthDate: string;
  activityRegion: Region;
  hasBookmark: boolean;
};

export type MyProfile = {
  id: number;
  name: string;
  nickname: string;
  introduction: string | null;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  activityRegion: Region;
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

export type MyProfileImage = {
  profileImageUrl: string | null;
};

export type ProfileImagePresignedUrlRequest = {
  contentType: string;
  fileSize: number;
};

export type ProfileImagePresignedUrlResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
};
