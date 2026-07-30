import {
  requestMeetingImagePresignedUrl,
  updateMeetingImages,
} from "@/features/team/api/meetingImage.api";
import type {
  LocalMeetingImage,
  MeetingImagePresignedUrlRequest,
  MeetingImagePresignedUrlResponse,
  MeetingImageUpdateResponse,
} from "@/features/team/types/meetingImage.types";
import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

export class MeetingImageStorageError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MeetingImageStorageError";
    this.status = status;
  }
}

type PutMeetingImageToS3Params = {
  uploadUrl: string;
  file: File;
  signal?: AbortSignal;
};

export async function putMeetingImageToS3({
  uploadUrl,
  file,
  signal,
}: PutMeetingImageToS3Params): Promise<void> {
  let response: Response;

  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "If-None-Match": "*",
      },
      body: file,
      credentials: "omit",
      signal,
    });
  } catch {
    throw new MeetingImageStorageError("사진 저장 서버와 통신하지 못했습니다.");
  }

  if (!response.ok) {
    throw new MeetingImageStorageError(
      "사진 저장에 실패했습니다.",
      response.status,
    );
  }
}

type MeetingImageUploadDependencies = {
  requestPresignedUrl: (
    meetingId: number,
    request: MeetingImagePresignedUrlRequest,
  ) => Promise<MeetingImagePresignedUrlResponse>;
  putImage: (params: PutMeetingImageToS3Params) => Promise<void>;
  updateImages: (
    meetingId: number,
    objectKeys: string[],
  ) => Promise<MeetingImageUpdateResponse>;
};

export type UploadMeetingImagesParams = {
  meetingId: number;
  images: LocalMeetingImage[];
  signal?: AbortSignal;
  onUploadStart?: (index: number, total: number) => void;
  onImageUploaded?: (imageId: string, objectKey: string) => void;
  onApplying?: () => void;
};

const defaultDependencies: MeetingImageUploadDependencies = {
  requestPresignedUrl: requestMeetingImagePresignedUrl,
  putImage: putMeetingImageToS3,
  updateImages: (meetingId, objectKeys) =>
    updateMeetingImages(meetingId, { objectKeys }),
};

export async function uploadMeetingImages(
  {
    meetingId,
    images,
    signal,
    onUploadStart,
    onImageUploaded,
    onApplying,
  }: UploadMeetingImagesParams,
  dependencies: MeetingImageUploadDependencies = defaultDependencies,
): Promise<MeetingImageUpdateResponse | undefined> {
  if (images.length === 0) {
    return undefined;
  }

  const objectKeys: string[] = [];

  for (const [index, image] of images.entries()) {
    if (image.uploadedObjectKey) {
      objectKeys.push(image.uploadedObjectKey);
      continue;
    }

    onUploadStart?.(index, images.length);
    let retriesRemaining = 1;

    while (true) {
      const presignedUrl = await dependencies.requestPresignedUrl(meetingId, {
        contentType: image.file.type,
        fileSize: image.file.size,
      });

      try {
        await dependencies.putImage({
          uploadUrl: presignedUrl.uploadUrl,
          file: image.file,
          signal,
        });
        objectKeys.push(presignedUrl.objectKey);
        onImageUploaded?.(image.id, presignedUrl.objectKey);
        break;
      } catch (error) {
        if (
          error instanceof MeetingImageStorageError &&
          error.status === 412 &&
          retriesRemaining > 0
        ) {
          retriesRemaining -= 1;
          continue;
        }

        throw error;
      }
    }
  }

  onApplying?.();
  return dependencies.updateImages(meetingId, objectKeys);
}

export function getMeetingImageUploadErrorMessage(error: unknown) {
  if (error instanceof MeetingImageStorageError) {
    if (error.status === 412) {
      return "사진 업로드 주소가 만료되었어요. 다시 시도해 주세요.";
    }

    if (error.status) {
      return "사진 저장 서버에서 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";
    }

    return "사진 저장 서버와 연결하지 못했어요. 네트워크와 CORS 설정을 확인한 뒤 다시 시도해 주세요.";
  }

  if (!(error instanceof ApiError)) {
    return "사진 업로드 중 알 수 없는 오류가 발생했어요. 다시 시도해 주세요.";
  }

  if (
    error.status === 400 &&
    (error.code === API_ERROR_CODE.UNSUPPORTED_MEETING_IMAGE_TYPE ||
      error.code === API_ERROR_CODE.MEETING_IMAGE_SIZE_EXCEEDED ||
      error.code === API_ERROR_CODE.MEETING_IMAGE_SIZE_MISMATCH ||
      error.code === API_ERROR_CODE.INVALID_MEETING_IMAGE_CONTENT)
  ) {
    return "사진 형식과 크기를 다시 확인해 주세요.";
  }

  if (
    error.status === 403 ||
    error.code === API_ERROR_CODE.MEETING_IMAGE_FORBIDDEN
  ) {
    return "모임장만 사진을 등록할 수 있어요.";
  }

  if (error.status === 404) {
    return "모임 또는 업로드한 사진을 찾을 수 없어요. 다시 시도해 주세요.";
  }

  if (error.status === 409) {
    return "사진 등록이 충돌했어요. 사진 등록을 다시 시도해 주세요.";
  }

  if (error.status === 429) {
    return "대기 중인 사진 업로드 요청이 많아요. 잠시 후 다시 시도해 주세요.";
  }

  if (
    error.status === 502 ||
    error.code === API_ERROR_CODE.S3_OPERATION_FAILED
  ) {
    return "사진 저장 서비스에 문제가 있어요. 잠시 후 다시 시도해 주세요.";
  }

  return "사진 업로드에 실패했어요. 다시 시도해 주세요.";
}
