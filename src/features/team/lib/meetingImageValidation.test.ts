import { describe, expect, it } from "vitest";

import {
  MAX_MEETING_IMAGE_SIZE_BYTES,
  validateMeetingImageSelection,
} from "./meetingImageValidation";

function createFile(name: string, type: string, size = 1, lastModified = 1) {
  return new File([new Uint8Array(size)], name, { type, lastModified });
}

describe("validateMeetingImageSelection", () => {
  it("JPEG, PNG, WebP 이미지를 허용한다", () => {
    const result = validateMeetingImageSelection({
      existingImages: [],
      files: [
        createFile("a.jpg", "image/jpeg"),
        createFile("b.png", "image/png"),
        createFile("c.webp", "image/webp"),
      ],
    });

    expect(result.acceptedFiles).toHaveLength(3);
    expect(result.rejectedReasons).toEqual([]);
  });

  it("지원하지 않는 GIF 형식을 거절한다", () => {
    const result = validateMeetingImageSelection({
      existingImages: [],
      files: [createFile("animated.gif", "image/gif")],
    });

    expect(result.acceptedFiles).toEqual([]);
    expect(result.rejectedReasons).toEqual(["unsupportedType"]);
  });

  it("0바이트 이미지는 거절한다", () => {
    const result = validateMeetingImageSelection({
      existingImages: [],
      files: [createFile("empty.jpg", "image/jpeg", 0)],
    });

    expect(result.acceptedFiles).toEqual([]);
    expect(result.rejectedReasons).toEqual(["emptyFile"]);
  });

  it("정확히 5MB 파일은 허용하고 초과 파일은 거절한다", () => {
    const result = validateMeetingImageSelection({
      existingImages: [],
      files: [
        createFile(
          "within-limit.jpg",
          "image/jpeg",
          MAX_MEETING_IMAGE_SIZE_BYTES,
        ),
        createFile(
          "too-large.jpg",
          "image/jpeg",
          MAX_MEETING_IMAGE_SIZE_BYTES + 1,
        ),
      ],
    });

    expect(result.acceptedFiles.map((file) => file.name)).toEqual([
      "within-limit.jpg",
    ]);
    expect(result.rejectedReasons).toEqual(["fileTooLarge"]);
  });

  it("최대 3장을 허용하고 네 번째 이미지는 거절한다", () => {
    const result = validateMeetingImageSelection({
      existingImages: [],
      files: [
        createFile("1.jpg", "image/jpeg"),
        createFile("2.jpg", "image/jpeg"),
        createFile("3.jpg", "image/jpeg"),
        createFile("4.jpg", "image/jpeg"),
      ],
    });

    expect(result.acceptedFiles.map((file) => file.name)).toEqual([
      "1.jpg",
      "2.jpg",
      "3.jpg",
    ]);
    expect(result.rejectedReasons).toEqual(["countExceeded"]);
  });

  it("동일 파일을 중복 선택하지 못하게 한다", () => {
    const file = createFile("same.jpg", "image/jpeg", 10, 1234);
    const result = validateMeetingImageSelection({
      existingImages: [{ file }],
      files: [createFile("same.jpg", "image/jpeg", 10, 1234)],
    });

    expect(result.acceptedFiles).toEqual([]);
    expect(result.rejectedReasons).toEqual(["duplicate"]);
  });
});
