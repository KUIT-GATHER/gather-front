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

export type LocalMeetingImage = {
  id: string;
  file: File;
  previewUrl: string;
  uploadedObjectKey?: string;
};
