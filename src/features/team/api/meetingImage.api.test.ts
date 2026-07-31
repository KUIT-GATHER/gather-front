/// <reference types="node" />

import { File as NodeFile } from "node:buffer";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { putMeetingImageToS3 } from "@/features/team/lib/meetingImageUpload";

import {
  getMeetingImages,
  requestMeetingImagePresignedUrl,
  updateMeetingImages,
} from "./meetingImage.api";

describe("meeting image MSW handlers", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "mock-access-token-1-1",
      isAuthenticated: true,
    });
  });

  it("Presigned URL 발급부터 S3 PUT, 이미지 반영과 공개 조회까지 처리한다", async () => {
    // jsdom File is serialized as a string by Node's fetch implementation.
    const file = new NodeFile(["mock-image"], "meeting.jpg", {
      type: "image/jpeg",
    }) as unknown as File;
    const presigned = await requestMeetingImagePresignedUrl(1, {
      contentType: file.type,
      fileSize: file.size,
    });

    await putMeetingImageToS3({ uploadUrl: presigned.uploadUrl, file });
    const updated = await updateMeetingImages(1, {
      objectKeys: [presigned.objectKey],
    });

    await expect(getMeetingImages(1)).resolves.toEqual(updated);
  });
});
