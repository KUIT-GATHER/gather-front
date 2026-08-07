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
