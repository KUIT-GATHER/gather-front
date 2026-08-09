import type {
  LocalMeetingImage,
  RemoteMeetingImage,
} from "@/features/team/types/meetingImage.types";
import {
  requestMeetingImagePresignedUrl,
  updateMeetingImages,
} from "@/features/team/api/meetingImage.api";
import { putMeetingImageToS3 } from "@/features/team/lib/meetingImageUpload";

export type EditableMeetingImage =
  | RemoteMeetingImage
  | (LocalMeetingImage & {
      source: "local";
    });

export function buildMeetingImageObjectKeys(images: EditableMeetingImage[]) {
  return images.map((image) => {
    if (image.source === "remote") {
      return image.objectKey;
    }

    if (!image.uploadedObjectKey) {
      throw new Error("새 이미지 업로드가 완료되지 않았습니다.");
    }

    return image.uploadedObjectKey;
  });
}

export async function saveMeetingImages(
  meetingId: number,
  images: EditableMeetingImage[],
) {
  const resolvedImages: EditableMeetingImage[] = [];
  for (const image of images) {
    if (image.source === "remote" || image.uploadedObjectKey) {
      resolvedImages.push(image);
      continue;
    }
    const presigned = await requestMeetingImagePresignedUrl(meetingId, {
      contentType: image.file.type,
      fileSize: image.file.size,
    });
    await putMeetingImageToS3({
      uploadUrl: presigned.uploadUrl,
      file: image.file,
    });
    resolvedImages.push({ ...image, uploadedObjectKey: presigned.objectKey });
  }
  return updateMeetingImages(meetingId, {
    objectKeys: buildMeetingImageObjectKeys(resolvedImages),
  });
}
