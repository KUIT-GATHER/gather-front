export type MeetingImagePresignedUrlRequest = {
  contentType: string;
  fileSize: number;
};

export type MeetingImagePresignedUrlResponse = {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresInSeconds: number;
};

export type MeetingImageUpdateRequest = {
  objectKeys: string[];
};

export type MeetingImageUpdateResponse = {
  imageUrls: string[];
};

export type MeetingImageListResponse = {
  imageUrls: string[];
};

export type MeetingManageImage = {
  objectKey: string;
  imageUrl: string;
  sortOrder: number;
};

export type RemoteMeetingImage = MeetingManageImage & {
  id: string;
  source: "remote";
  previewUrl: string;
};

export type LocalMeetingImage = {
  source?: "local";
  id: string;
  file: File;
  previewUrl: string;
  uploadedObjectKey?: string;
};
