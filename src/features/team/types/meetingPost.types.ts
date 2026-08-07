import type { UserStatus } from "@/shared/types/user.types";

export type EditableMeetingPostType = "NOTICE" | "REVIEW" | "FREE";
export type ReviewSourceType = "POSTING" | "MEETING_RECRUIT";
export type ReviewSourceValue = `${ReviewSourceType}:${number}`;

export type ReviewableActivity = {
  reviewSourceType: ReviewSourceType;
  reviewSourceId: number;
  title: string;
  activityStartAt: string;
  activityEndAt: string;
};

type MeetingPostWriteBase = {
  title: string;
  content: string;
  imageObjectKeys?: string[] | null;
};

export type MeetingPostCreateRequest =
  | (MeetingPostWriteBase & { type: "NOTICE" | "FREE" })
  | (MeetingPostWriteBase & {
      type: "REVIEW";
      reviewSourceType: ReviewSourceType;
      reviewSourceId: number;
    });

export type MeetingPostUpdateRequest = MeetingPostWriteBase;

export type PostImagePresignedUrlRequest = {
  contentType: string;
  fileSize: number;
};

export type PostImagePresignedUrlResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
};

export type MeetingPostAuthor = {
  authorId: number;
  authorNickname: string;
  userStatus?: UserStatus;
};
