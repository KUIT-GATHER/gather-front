import { HttpResponse, http } from "msw";

import type {
  MeetingRecruitDetail,
  MeetingRecruitRequest,
  RecruitParticipantSummary,
  UpdateAttendanceRequest,
} from "@/features/team/types/meetingRecruit.types";
import type {
  MeetingJoinRequest,
  MeetingMemberRole,
} from "@/features/team/types/team.types";
import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import {
  approveMockMeetingMember,
  isMockMeetingMember,
  removeMockMeetingMember,
  upsertMockMeetingRecruitPost,
} from "@/mocks/teamHandlers";

const ok = <T>(data: T, init?: ResponseInit) =>
  HttpResponse.json({ success: true, data, error: null }, init);
const fail = (code: string, message: string, status: number) =>
  HttpResponse.json(
    { success: false, data: null, error: { code, message } },
    { status },
  );

let manageImages = [
  {
    objectKey: "meetings/1/existing-1.jpg",
    imageUrl: "/src/assets/icons/Temp-volunteer-posting.svg",
    sortOrder: 0,
  },
];
const joinRequests: MeetingJoinRequest[] = [
  {
    joinRequestId: 1,
    userId: 201,
    nickname: "이민혁",
    status: "PENDING",
    requestedAt: "2026-08-07T12:00:00",
  },
  {
    joinRequestId: 2,
    userId: 202,
    nickname: "김하늘",
    status: "APPROVED",
    requestedAt: "2026-08-05T12:00:00",
  },
  {
    joinRequestId: 3,
    userId: 203,
    nickname: "박여름",
    status: "REJECTED",
    requestedAt: "2026-08-04T12:00:00",
  },
];
const memberDetails = new Map<
  number,
  { userId: number; nickname: string; role: MeetingMemberRole }
>([
  [1, { userId: 1, nickname: "가더", role: "HOST" }],
  ...Array.from(
    { length: 11 },
    (_, index) =>
      [
        101 + index,
        {
          userId: 101 + index,
          nickname: `팀원 ${index + 1}`,
          role: "MEMBER" as const,
        },
      ] as const,
  ),
]);
type MockRecruit = MeetingRecruitDetail & {
  confirmationStatus: "UNCONFIRMED" | "CONFIRMED";
  confirmedAt: string | null;
};

const recruitByPostId = new Map<number, MockRecruit>([
  [
    2,
    {
      postId: 2,
      meetingId: 1,
      meetingName: "따뜻한 마음",
      title: "한강공원 플로깅",
      content: "한강의 아름다운 환경을 지키기 위해 함께 뛰어요!",
      participationCondition: "만 14세 이상, 편한 복장 필수",
      authorId: 1,
      authorNickname: "가더",
      regionId: 41,
      regionName: "영등포구",
      place: "여의도 한강공원",
      activityStartAt: "2026-08-10T09:00:00",
      activityEndAt: "2026-08-10T12:00:00",
      maxParticipants: 30,
      categories: ["ENVIRONMENT"],
      timeRecognized: true,
      recognizedMinutes: 180,
      applyDeadlineAt: "2026-08-08T23:59:59",
      external: true,
      likeCount: 7,
      commentCount: 2,
      appliedCount: 2,
      participationStatus: null,
      participationAction: "APPLY",
      applicationOpen: true,
      full: false,
      canEdit: true,
      canDelete: true,
      createdAt: "2026-08-01T12:00:00",
      updatedAt: "2026-08-01T12:00:00",
      confirmationStatus: "UNCONFIRMED",
      confirmedAt: null,
    },
  ],
  [
    5,
    {
      postId: 5,
      meetingId: 1,
      meetingName: "따뜻한 마음",
      title: "6월 도시락 배달",
      content: "도시락 배달 봉사입니다.",
      participationCondition: null,
      authorId: 1,
      authorNickname: "가더",
      regionId: 32,
      regionName: "마포구",
      place: "마포사회복지관",
      activityStartAt: "2026-08-06T09:00:00",
      activityEndAt: "2026-08-06T12:00:00",
      maxParticipants: 4,
      categories: ["WELFARE"],
      timeRecognized: true,
      recognizedMinutes: 180,
      applyDeadlineAt: "2026-08-05T23:59:59",
      external: false,
      likeCount: 3,
      commentCount: 0,
      appliedCount: 2,
      participationStatus: "CONFIRMED",
      participationAction: "NONE",
      applicationOpen: false,
      full: false,
      canEdit: false,
      canDelete: true,
      createdAt: "2026-08-01T12:00:00",
      updatedAt: "2026-08-01T12:00:00",
      confirmationStatus: "CONFIRMED",
      confirmedAt: "2026-08-05T23:59:59",
    },
  ],
]);
const participantsByPostId = new Map<number, RecruitParticipantSummary[]>([
  [
    2,
    [
      {
        participationId: 1,
        userId: 101,
        nickname: "박서준",
        applicantType: "MEMBER",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: "2026-08-07T12:00:00",
      },
      {
        participationId: 2,
        userId: 301,
        nickname: "최민호",
        applicantType: "EXTERNAL",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: "2026-08-07T13:00:00",
      },
    ],
  ],
  [
    5,
    [
      {
        participationId: 3,
        userId: 101,
        nickname: "박서준",
        applicantType: "MEMBER",
        participationStatus: "CONFIRMED",
        attendanceStatus: "UNSET",
        appliedAt: "2026-08-01T12:00:00",
      },
      {
        participationId: 4,
        userId: 301,
        nickname: "최민호",
        applicantType: "EXTERNAL",
        participationStatus: "COMPLETED",
        attendanceStatus: "PRESENT",
        appliedAt: "2026-08-01T13:00:00",
      },
    ],
  ],
]);
let nextPostId = 100;

function personalDetail(userId: number, nickname: string) {
  return {
    userId,
    nickname,
    phoneNumber: "010-1234-5678",
    birthDate: "2000-01-01",
    regionId: 32,
    regionName: "서울 마포구",
    interestCategories: ["WELFARE", "ENVIRONMENT"],
    totalRecognizedMinutes: 720,
  };
}

export const meetingManagementHandlers = [
  http.get("*/api/v1/meetings/:meetingId/images/manage", ({ request }) =>
    getMockUserId(request) ? ok(manageImages) : createUnauthorizedResponse(),
  ),
  http.patch("*/api/v1/meetings/:meetingId/images", async ({ request }) => {
    if (!getMockUserId(request)) return createUnauthorizedResponse();
    const body = (await request.json()) as { objectKeys?: string[] };
    if (!Array.isArray(body.objectKeys) || body.objectKeys.length > 3)
      return fail("VALIDATION_ERROR", "사진은 최대 3장입니다.", 400);
    manageImages = body.objectKeys.map((objectKey, sortOrder) => ({
      objectKey,
      imageUrl: objectKey.startsWith("http")
        ? objectKey
        : `https://mock-s3.gather.local/${objectKey}`,
      sortOrder,
    }));
    return ok({ imageUrls: manageImages.map((image) => image.imageUrl) });
  }),
  http.get("*/api/v1/meetings/:meetingId/images", () =>
    ok({ imageUrls: manageImages.map((image) => image.imageUrl) }),
  ),
  http.get("*/api/v1/meetings/:meetingId/join-requests", ({ request }) => {
    if (!getMockUserId(request)) return createUnauthorizedResponse();
    const status = new URL(request.url).searchParams.get("status");
    return ok(
      status
        ? joinRequests.filter((item) => item.status === status)
        : joinRequests,
    );
  }),
  http.get(
    "*/api/v1/meetings/:meetingId/join-requests/:joinRequestId",
    ({ params, request }) => {
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      const item = joinRequests.find(
        (requestItem) =>
          requestItem.joinRequestId === Number(params.joinRequestId),
      );
      return item
        ? ok({ ...item, ...personalDetail(item.userId, item.nickname) })
        : fail("JOIN_REQUEST_NOT_FOUND", "가입 신청을 찾을 수 없습니다.", 404);
    },
  ),
  ...(["approve", "reject", "pending"] as const).map((action) =>
    http.patch(
      `*/api/v1/meetings/:meetingId/join-requests/:joinRequestId/${action}`,
      ({ params, request }) => {
        if (!getMockUserId(request)) return createUnauthorizedResponse();
        const item = joinRequests.find(
          (requestItem) =>
            requestItem.joinRequestId === Number(params.joinRequestId),
        );
        if (!item)
          return fail(
            "JOIN_REQUEST_NOT_FOUND",
            "가입 신청을 찾을 수 없습니다.",
            404,
          );
        item.status =
          action === "approve"
            ? "APPROVED"
            : action === "reject"
              ? "REJECTED"
              : "PENDING";
        if (action === "approve") {
          approveMockMeetingMember(
            Number(params.meetingId),
            item.userId,
            item.nickname,
          );
        }
        return ok(item);
      },
    ),
  ),
  http.get(
    "*/api/v1/meetings/:meetingId/members/:userId",
    ({ params, request }) => {
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      const member = memberDetails.get(Number(params.userId));
      return member
        ? ok({
            ...personalDetail(member.userId, member.nickname),
            role: member.role,
          })
        : fail("MEETING_MEMBER_NOT_FOUND", "멤버를 찾을 수 없습니다.", 404);
    },
  ),
  http.delete(
    "*/api/v1/meetings/:meetingId/members/:userId",
    ({ params, request }) => {
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      const userId = Number(params.userId);
      if (userId === 1)
        return fail(
          "MEETING_HOST_REMOVE_NOT_ALLOWED",
          "팀장은 내보낼 수 없습니다.",
          409,
        );
      memberDetails.delete(userId);
      removeMockMeetingMember(Number(params.meetingId), userId);
      return ok(null);
    },
  ),
  http.get(
    "*/api/v1/meetings/:meetingId/my/reviewable-activities",
    ({ request }) =>
      getMockUserId(request)
        ? ok([
            {
              reviewSourceType: "MEETING_RECRUIT",
              reviewSourceId: 5,
              title: "6월 도시락 배달",
              activityStartAt: "2026-08-06T09:00:00",
              activityEndAt: "2026-08-06T12:00:00",
            },
          ])
        : createUnauthorizedResponse(),
  ),
  http.post(
    "*/api/v1/meetings/:meetingId/posts/images/presigned-url",
    async ({ request }) => {
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      const objectKey = `posts/1/${crypto.randomUUID()}.jpg`;
      return ok({
        uploadUrl: `http://localhost:5173/__mock-s3/post-images/${encodeURIComponent(objectKey)}`,
        objectKey,
        publicUrl: `https://mock-s3.gather.local/${objectKey}`,
        expiresInSeconds: 300,
      });
    },
  ),
  http.put(
    "*/__mock-s3/post-images/:objectKey",
    () => new HttpResponse(null, { status: 200 }),
  ),
  http.get("*/api/v1/meetings/:meetingId/posts/recruits", () =>
    ok(
      [...recruitByPostId.values()].map((item) => ({
        postId: item.postId,
        title: item.title,
        place: item.place,
        activityStartAt: item.activityStartAt,
        activityEndAt: item.activityEndAt,
        applyDeadlineAt: item.applyDeadlineAt,
        appliedCount: item.appliedCount,
        maxParticipants: item.maxParticipants,
        external: item.external,
        applicationOpen: item.applicationOpen,
        confirmationStatus: item.confirmationStatus,
        confirmedAt: item.confirmedAt,
        canEdit: item.canEdit,
      })),
    ),
  ),
  http.post(
    "*/api/v1/meetings/:meetingId/posts/recruits",
    async ({ params, request }) => {
      const body = (await request.json()) as MeetingRecruitRequest;
      const postId = nextPostId++;
      const recruit = {
        ...recruitByPostId.get(2)!,
        ...body,
        postId,
        meetingId: Number(params.meetingId),
        appliedCount: 0,
        participationStatus: null,
        participationAction: "APPLY" as const,
        confirmationStatus: "UNCONFIRMED" as const,
        confirmedAt: null,
        createdAt: "2026-08-07T12:00:00",
        updatedAt: "2026-08-07T12:00:00",
      };
      recruitByPostId.set(postId, recruit);
      upsertMockMeetingRecruitPost({
        postId,
        meetingId: Number(params.meetingId),
        title: recruit.title,
        content: recruit.content,
      });
      participantsByPostId.set(postId, []);
      return ok(recruit, { status: 201 });
    },
  ),
  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit",
    async ({ params, request }) => {
      const recruit = recruitByPostId.get(Number(params.postId));
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      Object.assign(recruit, (await request.json()) as MeetingRecruitRequest);
      upsertMockMeetingRecruitPost({
        postId: recruit.postId,
        meetingId: recruit.meetingId,
        title: recruit.title,
        content: recruit.content,
      });
      return ok(recruit);
    },
  ),
  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit",
    ({ params, request }) => {
      const recruit = recruitByPostId.get(Number(params.postId));
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      const userId = getMockUserId(request);
      if (
        !recruit.external &&
        (!userId || !isMockMeetingMember(userId, Number(params.meetingId)))
      )
        return fail("MEETING_MEMBER_REQUIRED", "모임원 전용 공고입니다.", 403);
      return ok(recruit);
    },
  ),
  http.post(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participation",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();
      const recruit = recruitByPostId.get(Number(params.postId));
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      if (
        !recruit.external &&
        !isMockMeetingMember(userId, Number(params.meetingId))
      ) {
        return fail("MEETING_MEMBER_REQUIRED", "모임원 전용 공고입니다.", 403);
      }
      if (recruit.participationAction === "NONE") {
        return fail(
          "RECRUIT_PARTICIPATION_NOT_ALLOWED",
          "현재는 신청 상태를 변경할 수 없습니다.",
          409,
        );
      }
      const applying = recruit.participationAction === "APPLY";
      recruit.participationStatus = applying ? "APPLIED" : "CANCELLED";
      recruit.participationAction = applying ? "CANCEL" : "APPLY";
      recruit.appliedCount = Math.max(
        0,
        recruit.appliedCount + (applying ? 1 : -1),
      );
      return ok({
        participationId: 99,
        participationStatus: recruit.participationStatus,
        participationAction: recruit.participationAction,
        appliedCount: recruit.appliedCount,
      });
    },
  ),
  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants",
    ({ params }) => {
      const recruit = recruitByPostId.get(Number(params.postId));
      return recruit
        ? ok({
            postId: recruit.postId,
            confirmationStatus: recruit.confirmationStatus,
            confirmedAt: recruit.confirmedAt,
            activityStartAt: recruit.activityStartAt,
            activityEndAt: recruit.activityEndAt,
            participants: participantsByPostId.get(recruit.postId) ?? [],
          })
        : fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
    },
  ),
  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/:participationId",
    ({ params }) => {
      const participant = (
        participantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));
      return participant
        ? ok({
            ...participant,
            ...personalDetail(participant.userId, participant.nickname),
          })
        : fail(
            "RECRUIT_PARTICIPATION_NOT_FOUND",
            "신청자를 찾을 수 없습니다.",
            404,
          );
    },
  ),
  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/:participationId/reject",
    ({ params }) => {
      const recruit = recruitByPostId.get(Number(params.postId));
      const participant = (
        participantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));
      if (!participant)
        return fail(
          "RECRUIT_PARTICIPATION_NOT_FOUND",
          "신청자를 찾을 수 없습니다.",
          404,
        );
      if (
        recruit?.confirmationStatus === "CONFIRMED" ||
        participant.participationStatus !== "APPLIED"
      ) {
        return fail(
          "RECRUIT_REJECT_NOT_ALLOWED",
          "확정 전 신청자만 반려할 수 있습니다.",
          409,
        );
      }
      participant.participationStatus = "REJECTED";
      return ok({
        participationId: participant.participationId,
        participationStatus: "REJECTED",
        attendanceStatus: "UNSET",
        updatedAt: "2026-08-07T13:00:00",
      });
    },
  ),
  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/confirm",
    ({ params }) => {
      const postId = Number(params.postId);
      const recruit = recruitByPostId.get(postId);
      const participants = participantsByPostId.get(postId) ?? [];
      const applied = participants.filter(
        (item) => item.participationStatus === "APPLIED",
      );
      if (
        !recruit ||
        recruit.confirmationStatus === "CONFIRMED" ||
        applied.length === 0
      )
        return fail(
          "RECRUIT_CONFIRM_NOT_ALLOWED",
          "확정할 신청자가 없습니다.",
          409,
        );
      applied.forEach((item) => (item.participationStatus = "CONFIRMED"));
      recruit.confirmationStatus = "CONFIRMED";
      recruit.confirmedAt = "2026-08-07T13:00:00";
      return ok({
        postId,
        confirmationStatus: "CONFIRMED",
        confirmedAt: recruit.confirmedAt,
        confirmedCount: applied.length,
      });
    },
  ),
  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/:participationId/attendance",
    async ({ params, request }) => {
      const recruit = recruitByPostId.get(Number(params.postId));
      const participant = (
        participantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));
      if (!participant)
        return fail(
          "RECRUIT_PARTICIPATION_NOT_FOUND",
          "신청자를 찾을 수 없습니다.",
          404,
        );
      if (
        !recruit ||
        recruit.confirmationStatus !== "CONFIRMED" ||
        new Date(recruit.activityEndAt).getTime() > Date.now()
      ) {
        return fail(
          "RECRUIT_ATTENDANCE_NOT_ALLOWED",
          "활동 종료 후 확정 참가자의 출석을 처리할 수 있습니다.",
          409,
        );
      }
      const body = (await request.json()) as UpdateAttendanceRequest;
      if (
        body.attendanceStatus === "ABSENT" &&
        participant.participationStatus === "REVIEWED"
      ) {
        return fail("RECRUIT_REVIEW_EXISTS", "후기를 먼저 삭제해 주세요.", 409);
      }
      participant.attendanceStatus = body.attendanceStatus;
      participant.participationStatus =
        body.attendanceStatus === "PRESENT" ? "COMPLETED" : "CONFIRMED";
      return ok({
        participationId: participant.participationId,
        participationStatus: participant.participationStatus,
        attendanceStatus: participant.attendanceStatus,
        recognizedMinutesApplied:
          body.attendanceStatus === "PRESENT" && recruit.timeRecognized
            ? (recruit.recognizedMinutes ?? 0)
            : 0,
        updatedAt: "2026-08-07T13:00:00",
      });
    },
  ),
];
