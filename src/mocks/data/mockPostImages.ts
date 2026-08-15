const EXPIRATION_SECONDS = 300;

type MockPostImageUpload = {
  uploadId: string;
  ownerId: number;
  objectKey: string;
  publicUrl: string;
  contentType: string;
  expectedSize: number;
  expiresAt: number;
  imageData?: ArrayBuffer;
  applied: boolean;
};

const uploadsById = new Map<string, MockPostImageUpload>();
const uploadsByObjectKey = new Map<string, MockPostImageUpload>();

export function createMockPostImageUpload(
  ownerId: number,
  contentType: string,
  expectedSize: number,
) {
  const uploadId = crypto.randomUUID();
  const extension = contentType.split("/")[1];
  const objectKey = `posts/${ownerId}/${crypto.randomUUID()}.${extension}`;
  const publicUrl = `/__mock-s3/post-images/${uploadId}/public`;
  const upload: MockPostImageUpload = {
    uploadId,
    ownerId,
    objectKey,
    publicUrl,
    contentType,
    expectedSize,
    expiresAt: Date.now() + EXPIRATION_SECONDS * 1000,
    applied: false,
  };

  uploadsById.set(uploadId, upload);
  uploadsByObjectKey.set(objectKey, upload);

  return {
    uploadUrl: `/__mock-s3/post-images/${uploadId}`,
    objectKey,
    publicUrl,
    expiresInSeconds: EXPIRATION_SECONDS,
  };
}

export function storeMockPostImage(
  uploadId: string,
  contentType: string | null,
  imageData: ArrayBuffer,
) {
  const upload = uploadsById.get(uploadId);

  if (!upload) return 404;
  if (upload.imageData) return 412;
  if (
    Date.now() >= upload.expiresAt ||
    contentType !== upload.contentType ||
    imageData.byteLength !== upload.expectedSize
  ) {
    return 400;
  }

  upload.imageData = imageData;
  return 200;
}

export function applyMockPostImages(ownerId: number, objectKeys: string[]) {
  const uploads = objectKeys.map((objectKey) =>
    uploadsByObjectKey.get(objectKey),
  );

  if (
    uploads.some(
      (upload) =>
        !upload ||
        upload.ownerId !== ownerId ||
        !upload.imageData ||
        upload.applied ||
        Date.now() >= upload.expiresAt,
    )
  ) {
    return null;
  }

  uploads.forEach((upload) => {
    if (upload) upload.applied = true;
  });

  return uploads.map((upload) => upload?.publicUrl ?? "");
}

export function getMockPostImage(uploadId: string) {
  const upload = uploadsById.get(uploadId);

  return upload?.imageData
    ? { imageData: upload.imageData, contentType: upload.contentType }
    : null;
}
