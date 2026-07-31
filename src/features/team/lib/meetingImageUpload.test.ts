import { afterEach, describe, expect, it, vi } from "vitest";

import type { LocalMeetingImage } from "@/features/team/types/meetingImage.types";

import {
  MeetingImageStorageError,
  putMeetingImageToS3,
  uploadMeetingImages,
} from "./meetingImageUpload";

type UploadDependencies = NonNullable<
  Parameters<typeof uploadMeetingImages>[1]
>;

function createImage(
  id: string,
  name: string,
  uploadedObjectKey?: string,
): LocalMeetingImage {
  return {
    id,
    file: new File([name], name, { type: "image/jpeg", lastModified: 1 }),
    previewUrl: `blob:${id}`,
    uploadedObjectKey,
  };
}

function createDependencies(
  overrides: Partial<UploadDependencies> = {},
): UploadDependencies {
  return {
    requestPresignedUrl: vi.fn(async (_meetingId, request) => ({
      uploadUrl: `https://storage.example/${request.fileSize}`,
      objectKey: `object-${request.fileSize}`,
      publicUrl: "https://public.example/image.jpg",
      expiresInSeconds: 300,
    })),
    putImage: vi.fn(async () => undefined),
    updateImages: vi.fn(async (_meetingId: number, objectKeys: string[]) => ({
      imageUrls: objectKeys.map((objectKey) => `https://public/${objectKey}`),
    })),
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("putMeetingImageToS3", () => {
  it("S3 PUT에 원본 File과 계약된 요청 옵션만 사용한다", async () => {
    const file = new File(["image"], "photo.png", { type: "image/png" });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await putMeetingImageToS3({
      uploadUrl: "https://storage.example/presigned-url",
      file,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example/presigned-url",
      {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
          "If-None-Match": "*",
        },
        body: file,
        credentials: "omit",
        signal: undefined,
      },
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(requestInit.headers).has("Authorization")).toBe(false);
  });

  it("S3 HTTP 실패는 전용 오류로 구분한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    await expect(
      putMeetingImageToS3({
        uploadUrl: "https://storage.example/presigned-url",
        file: new File(["image"], "photo.jpg", { type: "image/jpeg" }),
      }),
    ).rejects.toMatchObject({
      name: "MeetingImageStorageError",
      status: 500,
    });
  });
});

describe("uploadMeetingImages", () => {
  it("선택 순서대로 objectKey를 PATCH에 전달한다", async () => {
    const events: string[] = [];
    const dependencies = createDependencies({
      requestPresignedUrl: vi.fn(async (_meetingId, request) => {
        events.push(`presign:${request.fileSize}`);
        return {
          uploadUrl: `https://storage.example/${request.fileSize}`,
          objectKey: `object-${request.fileSize}`,
          publicUrl: "https://public.example/image.jpg",
          expiresInSeconds: 300,
        };
      }),
      putImage: vi.fn(async ({ uploadUrl }) => {
        events.push(`put:${uploadUrl.split("/").at(-1)}`);
      }),
      updateImages: vi.fn(async (_meetingId, objectKeys) => {
        events.push(`patch:${objectKeys.join(",")}`);
        return { imageUrls: [] };
      }),
    });
    const first = createImage("first", "a.jpg");
    const second = createImage("second", "longer-name.jpg");

    await uploadMeetingImages(
      { meetingId: 1, images: [first, second] },
      dependencies,
    );

    expect(events).toEqual([
      `presign:${first.file.size}`,
      `put:${first.file.size}`,
      `presign:${second.file.size}`,
      `put:${second.file.size}`,
      `patch:object-${first.file.size},object-${second.file.size}`,
    ]);
  });

  it("이미 업로드된 파일은 Presigned URL 발급과 S3 PUT을 생략한다", async () => {
    const dependencies = createDependencies();
    const uploaded = createImage("uploaded", "a.jpg", "existing-key");
    const pending = createImage("pending", "b.jpg");

    await uploadMeetingImages(
      { meetingId: 1, images: [uploaded, pending] },
      dependencies,
    );

    expect(dependencies.requestPresignedUrl).toHaveBeenCalledTimes(1);
    expect(dependencies.putImage).toHaveBeenCalledTimes(1);
    expect(dependencies.updateImages).toHaveBeenCalledWith(1, [
      "existing-key",
      `object-${pending.file.size}`,
    ]);
  });

  it("부분 업로드 성공 상태를 보존하고 재시도 때 실패한 파일만 업로드한다", async () => {
    const first = createImage("first", "a.jpg");
    const second = createImage("second", "long-name.jpg");
    let localImages = [first, second];
    const dependencies = createDependencies({
      requestPresignedUrl: vi.fn(async (_meetingId, request) => ({
        uploadUrl: `https://storage.example/${request.fileSize}`,
        objectKey: `object-${request.fileSize}`,
        publicUrl: "https://public.example/image.jpg",
        expiresInSeconds: 300,
      })),
      putImage: vi.fn(async ({ uploadUrl }) => {
        if (uploadUrl.endsWith(String(second.file.size))) {
          throw new MeetingImageStorageError("failed", 500);
        }
      }),
    });
    const saveUploadedObjectKey = (imageId: string, objectKey: string) => {
      localImages = localImages.map((image) =>
        image.id === imageId
          ? { ...image, uploadedObjectKey: objectKey }
          : image,
      );
    };

    await expect(
      uploadMeetingImages(
        {
          meetingId: 1,
          images: localImages,
          onImageUploaded: saveUploadedObjectKey,
        },
        dependencies,
      ),
    ).rejects.toBeInstanceOf(MeetingImageStorageError);
    expect(localImages[0]?.uploadedObjectKey).toBe(`object-${first.file.size}`);

    (dependencies.putImage as ReturnType<typeof vi.fn>).mockImplementation(
      async () => undefined,
    );
    await uploadMeetingImages(
      {
        meetingId: 1,
        images: localImages,
        onImageUploaded: saveUploadedObjectKey,
      },
      dependencies,
    );

    expect(dependencies.putImage).toHaveBeenCalledTimes(3);
    expect(dependencies.requestPresignedUrl).toHaveBeenCalledTimes(3);
  });

  it("PATCH 실패 재시도에서는 S3 PUT을 다시 실행하지 않는다", async () => {
    let localImages = [createImage("first", "a.jpg")];
    const dependencies = createDependencies({
      updateImages: vi
        .fn()
        .mockRejectedValueOnce(new Error("PATCH failed"))
        .mockResolvedValueOnce({ imageUrls: ["https://public/object"] }),
    });
    const saveUploadedObjectKey = (imageId: string, objectKey: string) => {
      localImages = localImages.map((image) =>
        image.id === imageId
          ? { ...image, uploadedObjectKey: objectKey }
          : image,
      );
    };

    await expect(
      uploadMeetingImages(
        {
          meetingId: 1,
          images: localImages,
          onImageUploaded: saveUploadedObjectKey,
        },
        dependencies,
      ),
    ).rejects.toThrow("PATCH failed");
    await uploadMeetingImages(
      {
        meetingId: 1,
        images: localImages,
        onImageUploaded: saveUploadedObjectKey,
      },
      dependencies,
    );

    expect(dependencies.requestPresignedUrl).toHaveBeenCalledTimes(1);
    expect(dependencies.putImage).toHaveBeenCalledTimes(1);
    expect(dependencies.updateImages).toHaveBeenCalledTimes(2);
  });

  it("412 응답에서는 새 Presigned URL을 한 번 발급해 다시 업로드한다", async () => {
    const dependencies = createDependencies({
      requestPresignedUrl: vi
        .fn()
        .mockResolvedValueOnce({
          uploadUrl: "https://storage.example/first",
          objectKey: "first-key",
          publicUrl: "https://public.example/first",
          expiresInSeconds: 300,
        })
        .mockResolvedValueOnce({
          uploadUrl: "https://storage.example/second",
          objectKey: "second-key",
          publicUrl: "https://public.example/second",
          expiresInSeconds: 300,
        }),
      putImage: vi
        .fn()
        .mockRejectedValueOnce(new MeetingImageStorageError("conflict", 412))
        .mockResolvedValueOnce(undefined),
    });

    await uploadMeetingImages(
      { meetingId: 1, images: [createImage("first", "a.jpg")] },
      dependencies,
    );

    expect(dependencies.requestPresignedUrl).toHaveBeenCalledTimes(2);
    expect(dependencies.putImage).toHaveBeenNthCalledWith(1, {
      uploadUrl: "https://storage.example/first",
      file: expect.any(File),
      signal: undefined,
    });
    expect(dependencies.putImage).toHaveBeenNthCalledWith(2, {
      uploadUrl: "https://storage.example/second",
      file: expect.any(File),
      signal: undefined,
    });
    expect(dependencies.updateImages).toHaveBeenCalledWith(1, ["second-key"]);
  });

  it("이미지가 없으면 이미지 API를 호출하지 않는다", async () => {
    const dependencies = createDependencies();

    await expect(
      uploadMeetingImages({ meetingId: 1, images: [] }, dependencies),
    ).resolves.toBeUndefined();

    expect(dependencies.requestPresignedUrl).not.toHaveBeenCalled();
    expect(dependencies.putImage).not.toHaveBeenCalled();
    expect(dependencies.updateImages).not.toHaveBeenCalled();
  });
});
