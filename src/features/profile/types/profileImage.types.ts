export type ProfileImage = {
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
