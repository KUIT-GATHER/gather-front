import { HttpResponse, http } from "msw";

import regions from "./data/regions.json";
import {
  applyMockAutomaticConfirmation,
  mockMeetingRecruitsByPostId,
  mockRecruitParticipantsByPostId,
} from "./data/mockMeetingRecruits";
import { getMockParticipations } from "./data/mockParticipations";
import { createUnauthorizedResponse, getMockUserId } from "./lib/mockAuth";
import {
  getMockPostingParticipationAction,
  mockPostings,
} from "./postingHandlers";

import { profileEditSchema } from "@/features/my/schemas/profileEdit.schema";
import type { ProfileEditFormValues } from "@/features/my/schemas/profileEdit.schema";
import type {
  MyActivityRecord,
  MyPageActivity,
} from "@/features/my/types/myActivity.types";

const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PENDING_UPLOADS = 5;

const regionById = new Map(regions.data.map((region) => [region.id, region]));

type MockProfile = Omit<ProfileEditFormValues, "activityRegionId"> & {
  id: number;
  activityRegionId: number | null;
};

type PendingProfileImageUpload = {
  ownerId: number;
  contentType: string;
  fileSize: number;
  objectKey: string;
  publicUrl: string;
  imageData?: ArrayBuffer;
  uploaded: boolean;
  applied: boolean;
};

const profiles = new Map<number, MockProfile>();
const profileImageUrls = new Map<number, string>();
const pendingUploads = new Map<string, PendingProfileImageUpload>();
let nextUploadId = 1;

const mockActivityRecords: MyActivityRecord[] = [
  {
    participationId: 1,
    postingId: 10,
    title: "어린이 독서 지도",
    category: "EDUCATION",
    actStartDate: "2026-04-10",
    actEndDate: "2026-04-10",
    actPlace: "책읽는 친구들",
    timeCertifiable: true,
    recognizedMinutes: 120,
  },
  {
    participationId: 2,
    postingId: 11,
    title: "공원 나무 심기",
    category: "ENVIRONMENT",
    actStartDate: "2026-03-15",
    actEndDate: "2026-03-15",
    actPlace: "그린 서울",
    timeCertifiable: true,
    recognizedMinutes: 180,
  },
  {
    participationId: 3,
    postingId: 12,
    title: "유기견 산책 봉사",
    category: "WELFARE",
    actStartDate: "2026-02-10",
    actEndDate: "2026-02-10",
    actPlace: "남양주 보호소",
    timeCertifiable: true,
    recognizedMinutes: 240,
  },
  {
    participationId: 4,
    postingId: 13,
    title: "문화재 보존 활동",
    category: "CULTURE",
    actStartDate: "2026-01-24",
    actEndDate: "2026-01-24",
    actPlace: "서울 문화재단",
    timeCertifiable: true,
    recognizedMinutes: 600,
  },
  {
    participationId: 5,
    postingId: 14,
    title: "지역 아동 행사 지원",
    category: "COMMUNITY",
    actStartDate: "2025-12-20",
    actEndDate: "2025-12-20",
    actPlace: "광진구 주민센터",
    timeCertifiable: false,
    recognizedMinutes: null,
  },
];

function getProfile(userId: number) {
  const existing = profiles.get(userId);
  if (existing) return existing;

  const profile: MockProfile = {
    id: userId,
    name: "동진",
    nickname: userId === 1 ? "가더" : `Gather_${userId}`,
    introduction: "함께 봉사하는 걸 좋아해요.",
    birthDate: "2000-01-01",
    gender: "MALE",
    activityRegionId: 41,
    interestCategories: ["ENVIRONMENT", "COMMUNITY"],
  };
  profiles.set(userId, profile);
  return profile;
}

function toProfileResponse(profile: MockProfile) {
  return {
    id: profile.id,
    name: profile.name,
    nickname: profile.nickname,
    introduction: profile.introduction,
    birthDate: profile.birthDate,
    gender: profile.gender,
    activityRegion:
      profile.activityRegionId === null
        ? null
        : regionById.get(profile.activityRegionId),
    interestCategories: profile.interestCategories,
  };
}

function errorResponse(code: string, message: string, status: number) {
  return HttpResponse.json(
    { success: false, data: null, error: { code, message } },
    { status },
  );
}

function getPendingUploadCount(userId: number) {
  return [...pendingUploads.values()].filter(
    (upload) => upload.ownerId === userId && !upload.applied,
  ).length;
}

function formatMockTime(time: string | null) {
  if (!time) return null;
  return time.includes(":") ? time : `${time.padStart(2, "0")}:00`;
}

export const myProfileHandlers = [
  http.get("*/api/v1/mypage/home", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const profile = getProfile(userId);
    return HttpResponse.json({
      success: true,
      data: {
        nickname: profile.nickname,
        profileImageUrl: profileImageUrls.get(userId) ?? null,
        birthDate: profile.birthDate,
        activityRegion:
          profile.activityRegionId === null
            ? null
            : regionById.get(profile.activityRegionId),
        hasBookmark: userId === 1,
      },
      error: null,
    });
  }),
  http.get("*/api/v1/mypage/activities", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const yearMonth = new URL(request.url).searchParams.get("yearMonth");
    if (!yearMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
      return errorResponse(
        "VALIDATION_ERROR",
        "요청 값이 올바르지 않습니다.",
        400,
      );
    }

    const [year, month] = yearMonth.split("-").map(Number);
    const monthStart = `${yearMonth}-01`;
    const monthEnd = `${yearMonth}-${new Date(year, month, 0).getDate()}`;
    const participations = getMockParticipations(userId);
    const participationActivities: MyPageActivity[] = participations.flatMap(
      (participation) => {
        if (
          participation.status !== "APPLIED" &&
          participation.status !== "CONFIRMED"
        ) {
          return [];
        }

        const posting = mockPostings.find(
          (item) => item.id === participation.postingId,
        );

        if (!posting) return [];

        const participationAction =
          getMockPostingParticipationAction(posting.id, userId) === "CANCEL"
            ? "CANCEL"
            : "NONE";

        return [
          {
            activityType: "VOLUNTEER",
            participationId: participation.participationId,
            postingId: posting.id,
            meetingId: null,
            title: posting.title,
            actStartDate:
              participation.participationStartDate ?? posting.actStartDate,
            actEndDate:
              participation.participationEndDate ??
              posting.actEndDate ??
              posting.actStartDate,
            actStartTime: formatMockTime(posting.actStartTime),
            actEndTime: formatMockTime(posting.actEndTime),
            actPlace: posting.actPlace ?? null,
            regionName: null,
            status: participation.status,
            participationAction,
          },
        ];
      },
    );
    const meetingRecruitActivities: MyPageActivity[] = [
      ...mockMeetingRecruitsByPostId.values(),
    ].flatMap((recruit) => {
      applyMockAutomaticConfirmation(recruit);
      const participant = (
        mockRecruitParticipantsByPostId.get(recruit.postId) ?? []
      ).find((item) => item.userId === userId);

      if (
        !participant ||
        (participant.participationStatus !== "APPLIED" &&
          participant.participationStatus !== "CONFIRMED")
      ) {
        return [];
      }

      return [
        {
          activityType: "MEETING_RECRUIT",
          participationId: participant.participationId,
          meetingId: recruit.meetingId,
          postId: recruit.postId,
          title: recruit.title,
          actStartDate: recruit.activityStartAt.slice(0, 10),
          actEndDate: recruit.activityEndAt.slice(0, 10),
          actStartTime: recruit.activityStartAt.slice(11, 16),
          actEndTime: recruit.activityEndAt.slice(11, 16),
          actPlace: recruit.place,
          regionName: recruit.regionName,
          status: participant.participationStatus,
          participationAction:
            participant.participationStatus === "APPLIED" &&
            recruit.applicationOpen
              ? "CANCEL"
              : "NONE",
        },
      ];
    });
    const activities = [
      ...participationActivities,
      ...meetingRecruitActivities,
    ].filter((activity) => {
      const effectiveEndDate = activity.actEndDate ?? activity.actStartDate;

      return (
        effectiveEndDate >= monthStart && activity.actStartDate <= monthEnd
      );
    });

    return HttpResponse.json({
      success: true,
      data: activities,
      error: null,
    });
  }),
  http.get("*/api/v1/mypage/activities/summary", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    return HttpResponse.json({
      success: true,
      data: {
        totalCompletedCount: mockActivityRecords.length,
        totalRecognizedMinutes: mockActivityRecords.reduce(
          (sum, activity) => sum + (activity.recognizedMinutes ?? 0),
          0,
        ),
        timeCertifiableCompletedCount: mockActivityRecords.filter(
          (activity) => activity.timeCertifiable,
        ).length,
        categoryBlocks: [
          "ENVIRONMENT",
          "EDUCATION",
          "WELFARE",
          "CULTURE",
          "COMMUNITY",
          "OVERSEAS",
        ].map((category) => ({
          category,
          count: mockActivityRecords.filter(
            (activity) => activity.category === category,
          ).length,
        })),
      },
      error: null,
    });
  }),
  http.get("*/api/v1/mypage/activities/records", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const params = new URL(request.url).searchParams;
    const category = params.get("category");
    const page = Math.max(0, Number(params.get("page")) || 0);
    const size = Math.max(1, Number(params.get("size")) || 20);
    const filtered = category
      ? mockActivityRecords.filter((activity) => activity.category === category)
      : mockActivityRecords;

    return HttpResponse.json({
      success: true,
      data: {
        content: filtered.slice(page * size, (page + 1) * size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        page,
        size,
      },
      error: null,
    });
  }),
  http.get("*/api/v1/users/me", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    return HttpResponse.json({
      success: true,
      data: toProfileResponse(getProfile(userId)),
      error: null,
    });
  }),

  http.patch("*/api/v1/users/me", async ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const result = profileEditSchema.safeParse(await request.json());
    if (
      !result.success ||
      result.data.activityRegionId === null ||
      !regionById.has(result.data.activityRegionId)
    ) {
      return errorResponse(
        "VALIDATION_ERROR",
        "요청 값이 올바르지 않습니다.",
        400,
      );
    }

    const duplicateNickname = [...profiles.values()].some(
      (profile) =>
        profile.id !== userId && profile.nickname === result.data.nickname,
    );
    if (duplicateNickname) {
      return errorResponse(
        "DUPLICATE_NICKNAME",
        "이미 사용 중인 닉네임입니다.",
        409,
      );
    }

    const updated: MockProfile = { id: userId, ...result.data };
    profiles.set(userId, updated);

    return HttpResponse.json({
      success: true,
      data: toProfileResponse(updated),
      error: null,
    });
  }),

  http.get("*/api/v1/users/me/profile-image", ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    getProfile(userId);
    return HttpResponse.json({
      success: true,
      data: { profileImageUrl: profileImageUrls.get(userId) ?? null },
      error: null,
    });
  }),

  http.post(
    "*/api/v1/users/me/profile-image/presigned-url",
    async ({ request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const body = (await request.json()) as {
        contentType?: string;
        fileSize?: number;
      };
      if (
        !body.contentType ||
        !PROFILE_IMAGE_TYPES.has(body.contentType) ||
        typeof body.fileSize !== "number" ||
        body.fileSize <= 0 ||
        body.fileSize > MAX_PROFILE_IMAGE_SIZE
      ) {
        return errorResponse(
          "VALIDATION_ERROR",
          "요청 값이 올바르지 않습니다.",
          400,
        );
      }

      if (getPendingUploadCount(userId) >= MAX_PENDING_UPLOADS) {
        return errorResponse(
          "PROFILE_IMAGE_UPLOAD_LIMIT_EXCEEDED",
          "처리되지 않은 프로필 이미지 업로드 요청이 너무 많습니다.",
          429,
        );
      }

      const uploadId = String(nextUploadId++);
      const extension = body.contentType.split("/")[1];
      const objectKey = `profiles/${userId}/mock-${uploadId}.${extension}`;
      const publicUrl = `http://localhost:5173/__mock-s3/profile-images/${uploadId}/public`;
      pendingUploads.set(uploadId, {
        ownerId: userId,
        contentType: body.contentType,
        fileSize: body.fileSize,
        objectKey,
        publicUrl,
        uploaded: false,
        applied: false,
      });

      return HttpResponse.json({
        success: true,
        data: {
          uploadUrl: `http://localhost:5173/__mock-s3/profile-images/${uploadId}`,
          objectKey,
          publicUrl,
          expiresInSeconds: 300,
        },
        error: null,
      });
    },
  ),

  http.put(
    "*/__mock-s3/profile-images/:uploadId",
    async ({ params, request }) => {
      const upload = pendingUploads.get(String(params.uploadId));
      if (!upload) return new HttpResponse(null, { status: 404 });
      if (upload.uploaded) return new HttpResponse(null, { status: 412 });
      if (
        request.headers.get("Content-Type") !== upload.contentType ||
        request.headers.get("If-None-Match") !== "*"
      ) {
        return new HttpResponse(null, { status: 400 });
      }

      const imageData = await request.arrayBuffer();
      if (imageData.byteLength !== upload.fileSize) {
        return new HttpResponse(null, { status: 400 });
      }

      upload.imageData = imageData;
      upload.uploaded = true;
      return new HttpResponse(null, { status: 200 });
    },
  ),

  http.get("*/__mock-s3/profile-images/:uploadId/public", ({ params }) => {
    const upload = pendingUploads.get(String(params.uploadId));
    if (!upload?.uploaded || !upload.imageData) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(upload.imageData, {
      headers: {
        "Content-Type": upload.contentType,
        "Cache-Control": "no-store",
      },
    });
  }),
  http.patch("*/api/v1/users/me/profile-image", async ({ request }) => {
    const userId = getMockUserId(request);
    if (!userId) return createUnauthorizedResponse();

    const body = (await request.json()) as { objectKey?: string };
    const upload = [...pendingUploads.values()].find(
      (item) => item.objectKey === body.objectKey && item.ownerId === userId,
    );
    if (!upload || !upload.uploaded) {
      return errorResponse(
        "PROFILE_IMAGE_OBJECT_NOT_FOUND",
        "업로드된 프로필 이미지 객체를 찾을 수 없습니다.",
        404,
      );
    }

    upload.applied = true;
    profileImageUrls.set(userId, upload.publicUrl);

    return HttpResponse.json({
      success: true,
      data: { profileImageUrl: upload.publicUrl },
      error: null,
    });
  }),
];
