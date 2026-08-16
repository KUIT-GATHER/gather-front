import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyProfileImage,
  requestProfileImagePresignedUrl,
} from "@/features/profile/api/profileImage.api";

import {
  ProfileImageUploadError,
  uploadProfileImage,
} from "./profileImageUpload";

vi.mock("@/features/profile/api/profileImage.api", () => ({
  applyProfileImage: vi.fn(),
  requestProfileImagePresignedUrl: vi.fn(),
}));

const mockedRequestPresignedUrl = vi.mocked(requestProfileImagePresignedUrl);
const mockedApplyProfileImage = vi.mocked(applyProfileImage);

function createImage() {
  return new File(["image"], "profile.png", { type: "image/png" });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  mockedRequestPresignedUrl.mockReset();
  mockedApplyProfileImage.mockReset();
});

describe("uploadProfileImage", () => {
  it("유효하지 않은 파일은 presigned URL 요청 전에 거부한다", async () => {
    await expect(
      uploadProfileImage(
        new File(["gif"], "profile.gif", { type: "image/gif" }),
      ),
    ).rejects.toMatchObject({ name: "ProfileImageUploadError" });

    expect(mockedRequestPresignedUrl).not.toHaveBeenCalled();
  });

  it("presigned URL을 받아 S3에 업로드하고 objectKey를 적용한다", async () => {
    const file = createImage();
    mockedRequestPresignedUrl.mockResolvedValue({
      uploadUrl: "https://storage.example/profile",
      objectKey: "profiles/1/profile.png",
      publicUrl: "https://cdn.example/profile.png",
      expiresInSeconds: 300,
    });
    mockedApplyProfileImage.mockResolvedValue({
      profileImageUrl: "https://cdn.example/profile.png",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(uploadProfileImage(file)).resolves.toEqual({
      profileImageUrl: "https://cdn.example/profile.png",
    });

    expect(mockedRequestPresignedUrl).toHaveBeenCalledWith({
      contentType: "image/png",
      fileSize: file.size,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.example/profile",
      expect.objectContaining({
        method: "PUT",
        body: file,
        credentials: "omit",
        headers: {
          "Content-Type": "image/png",
          "If-None-Match": "*",
        },
      }),
    );
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(requestInit.headers).has("Authorization")).toBe(false);
    expect(mockedApplyProfileImage).toHaveBeenCalledWith(
      "profiles/1/profile.png",
    );
  });

  it("S3 412 응답이면 presigned URL을 한 번 갱신해 재시도한다", async () => {
    const file = createImage();
    mockedRequestPresignedUrl
      .mockResolvedValueOnce({
        uploadUrl: "https://storage.example/expired",
        objectKey: "profiles/1/expired.png",
        publicUrl: "https://cdn.example/expired.png",
        expiresInSeconds: 300,
      })
      .mockResolvedValueOnce({
        uploadUrl: "https://storage.example/fresh",
        objectKey: "profiles/1/fresh.png",
        publicUrl: "https://cdn.example/fresh.png",
        expiresInSeconds: 300,
      });
    mockedApplyProfileImage.mockResolvedValue({ profileImageUrl: null });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 412 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await uploadProfileImage(file);

    expect(mockedRequestPresignedUrl).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(mockedApplyProfileImage).toHaveBeenCalledWith(
      "profiles/1/fresh.png",
    );
  });

  it("412가 아닌 업로드 실패는 재시도하지 않는다", async () => {
    const file = createImage();
    mockedRequestPresignedUrl.mockResolvedValue({
      uploadUrl: "https://storage.example/profile",
      objectKey: "profiles/1/profile.png",
      publicUrl: "https://cdn.example/profile.png",
      expiresInSeconds: 300,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(uploadProfileImage(file)).rejects.toBeInstanceOf(
      ProfileImageUploadError,
    );

    expect(mockedRequestPresignedUrl).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(mockedApplyProfileImage).not.toHaveBeenCalled();
  });
});
