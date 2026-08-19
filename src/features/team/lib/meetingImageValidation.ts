import type { LocalMeetingImage } from "@/features/team/types/meetingImage.types";

export const MEETING_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_MEETING_COVER_IMAGE_COUNT = 3;
export const MAX_MEETING_POST_IMAGE_COUNT = 3;
export const MAX_MEETING_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type MeetingImageValidationReason =
  | "unsupportedType"
  | "emptyFile"
  | "fileTooLarge"
  | "duplicate"
  | "countExceeded";

export type MeetingImageSelectionResult = {
  acceptedFiles: File[];
  rejectedReasons: MeetingImageValidationReason[];
};

function getMeetingImageFileKey(file: File) {
  return [file.name, file.size, file.lastModified, file.type].join("::");
}

export function isMeetingImageMimeType(
  type: string,
): type is (typeof MEETING_IMAGE_MIME_TYPES)[number] {
  return MEETING_IMAGE_MIME_TYPES.some((mimeType) => mimeType === type);
}

export function validateMeetingImageSelection({
  existingImages,
  existingCount = existingImages.length,
  files,
  maxCount = MAX_MEETING_POST_IMAGE_COUNT,
}: {
  existingImages: Pick<LocalMeetingImage, "file">[];
  existingCount?: number;
  files: Iterable<File>;
  maxCount?: number;
}): MeetingImageSelectionResult {
  const knownFileKeys = new Set(
    existingImages.map((image) => getMeetingImageFileKey(image.file)),
  );
  const acceptedFiles: File[] = [];
  const rejectedReasons: MeetingImageValidationReason[] = [];

  for (const file of files) {
    if (!isMeetingImageMimeType(file.type)) {
      rejectedReasons.push("unsupportedType");
      continue;
    }

    if (file.size <= 0) {
      rejectedReasons.push("emptyFile");
      continue;
    }

    if (file.size > MAX_MEETING_IMAGE_SIZE_BYTES) {
      rejectedReasons.push("fileTooLarge");
      continue;
    }

    const fileKey = getMeetingImageFileKey(file);

    if (knownFileKeys.has(fileKey)) {
      rejectedReasons.push("duplicate");
      continue;
    }

    if (existingCount + acceptedFiles.length >= maxCount) {
      rejectedReasons.push("countExceeded");
      continue;
    }

    knownFileKeys.add(fileKey);
    acceptedFiles.push(file);
  }

  return { acceptedFiles, rejectedReasons };
}

export function getMeetingImageSelectionErrorMessage(
  rejectedReasons: MeetingImageValidationReason[],
  maxCount = MAX_MEETING_POST_IMAGE_COUNT,
) {
  if (rejectedReasons.includes("unsupportedType")) {
    return "JPEG, PNG, WebP 형식의 사진만 첨부할 수 있어요.";
  }

  if (rejectedReasons.includes("emptyFile")) {
    return "비어 있는 사진 파일은 첨부할 수 없어요.";
  }

  if (rejectedReasons.includes("fileTooLarge")) {
    return "사진 한 장은 5MB 이하만 첨부할 수 있어요.";
  }

  if (rejectedReasons.includes("duplicate")) {
    return "같은 사진은 한 번만 첨부할 수 있어요.";
  }

  return `사진은 최대 ${maxCount}장까지 첨부할 수 있어요.`;
}
