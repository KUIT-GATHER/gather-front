import { HttpResponse, http } from "msw";

import type {
  MeetingRecruitRequest,
  RecruitParticipantSummary,
  RecruitParticipationAction,
  UpdateAttendanceRequest,
} from "@/features/team/types/meetingRecruit.types";
import type { MeetingJoinRequest } from "@/features/team/types/team.types";
import {
  applyMockAutomaticConfirmation,
  getMockRecruitAppliedCount,
  getNextMockRecruitParticipationId,
  hasUpcomingConfirmedMockRecruit,
  mockMeetingRecruitsByPostId,
  mockRecruitParticipantsByPostId,
  syncMockRecruitCounts,
} from "@/mocks/data/mockMeetingRecruits";
import { getMockUserById } from "@/mocks/data/mockUsers";
import {
  createUnauthorizedResponse,
  getMockUserId,
} from "@/mocks/lib/mockAuth";
import {
  approveMockMeetingMember,
  getMockMeeting,
  getMockMeetingManageImages,
  getMockMeetingMembers,
  getMockMeetingRole,
  getMockPendingJoinRequests,
  isMockMeetingMember,
  removeMockMeetingMember,
  updateMockPendingJoinRequest,
  upsertMockMeetingRecruitPost,
} from "@/mocks/teamHandlers";

const ok = <T>(data: T, init?: ResponseInit) =>
  HttpResponse.json({ success: true, data, error: null }, init);
const fail = (code: string, message: string, status: number) =>
  HttpResponse.json(
    { success: false, data: null, error: { code, message } },
    { status },
  );

const joinRequestsByMeetingId = new Map<number, MeetingJoinRequest[]>([
  [
    10,
    [
      {
        joinRequestId: 1001,
        userId: 201,
        nickname: "가입 대기자",
        status: "PENDING",
        requestedAt: "2026-08-07T12:00:00",
      },
      {
        joinRequestId: 1002,
        userId: 202,
        nickname: "승인된 신청자",
        status: "APPROVED",
        requestedAt: "2026-08-05T12:00:00",
      },
      {
        joinRequestId: 1003,
        userId: 203,
        nickname: "반려된 신청자",
        status: "REJECTED",
        requestedAt: "2026-08-04T12:00:00",
      },
    ],
  ],
]);

const recognizedMinutesByUserId = new Map<number, number>([
  [1, 720],
  [101, 720],
  [102, 900],
  [103, 540],
  [301, 0],
  [302, 180],
]);

let nextPostId = 106;

for (const recruit of mockMeetingRecruitsByPostId.values()) {
  syncMockRecruitCounts(recruit);
  upsertMockMeetingRecruitPost({
    postId: recruit.postId,
    meetingId: recruit.meetingId,
    title: recruit.title,
    content: recruit.content,
  });
}

function getMeetingJoinRequests(meetingId: number) {
  return [
    ...(joinRequestsByMeetingId.get(meetingId) ?? []),
    ...getMockPendingJoinRequests(meetingId),
  ];
}

function getPersonalDetail(userId: number, fallbackNickname: string) {
  const user = getMockUserById(userId);

  return {
    userId,
    nickname: user?.nickname ?? fallbackNickname,
    phoneNumber: user?.phoneNumber ?? "010-1234-5678",
    birthDate: user?.birthDate ?? "2000-01-01",
    regionId: user?.activityRegionId ?? 32,
    regionName: "서울 마포구",
    interestCategories: user?.interestCategories ?? ["WELFARE", "ENVIRONMENT"],
    totalRecognizedMinutes: recognizedMinutesByUserId.get(userId) ?? 720,
  };
}

function isMeetingHost(request: Request, meetingId: number) {
  const userId = getMockUserId(request);

  return userId !== null && getMockMeetingRole(userId, meetingId) === "HOST";
}

function getRecruit(postId: number, meetingId: number) {
  const recruit = mockMeetingRecruitsByPostId.get(postId);

  return recruit?.meetingId === meetingId ? recruit : null;
}

function getParticipationAction(
  recruit: NonNullable<ReturnType<typeof getRecruit>>,
  participant?: RecruitParticipantSummary,
): RecruitParticipationAction {
  if (recruit.confirmationStatus === "CONFIRMED" || !recruit.applicationOpen) {
    return "NONE";
  }

  if (participant?.participationStatus === "APPLIED") {
    return "CANCEL";
  }

  if (participant && participant.participationStatus !== "CANCELLED") {
    return "NONE";
  }

  return "APPLY";
}

function getViewerRecruit(
  recruit: NonNullable<ReturnType<typeof getRecruit>>,
  userId: number | null,
) {
  applyMockAutomaticConfirmation(recruit);
  syncMockRecruitCounts(recruit);

  const participant = userId
    ? (mockRecruitParticipantsByPostId.get(recruit.postId) ?? []).find(
        (item) => item.userId === userId,
      )
    : undefined;

  return {
    ...recruit,
    participationStatus: participant?.participationStatus ?? null,
    participationAction: getParticipationAction(recruit, participant),
  };
}

function getManagedRecruit(
  recruit: NonNullable<ReturnType<typeof getRecruit>>,
) {
  applyMockAutomaticConfirmation(recruit);
  syncMockRecruitCounts(recruit);

  return {
    postId: recruit.postId,
    title: recruit.title,
    place: recruit.place,
    activityStartAt: recruit.activityStartAt,
    activityEndAt: recruit.activityEndAt,
    applyDeadlineAt: recruit.applyDeadlineAt,
    appliedCount: recruit.appliedCount,
    maxParticipants: recruit.maxParticipants,
    external: recruit.external,
    applicationOpen: recruit.applicationOpen,
    confirmationStatus: recruit.confirmationStatus,
    confirmedAt: recruit.confirmedAt,
    canEdit: recruit.canEdit,
  };
}

export const meetingManagementHandlers = [
  http.get(
    "*/api/v1/meetings/:meetingId/images/manage",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      if (!getMockMeeting(meetingId)) {
        return fail("MEETING_NOT_FOUND", "모임을 찾을 수 없습니다.", 404);
      }
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      return ok(getMockMeetingManageImages(meetingId));
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/join-requests",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      const status = new URL(request.url).searchParams.get("status");
      const requests = getMeetingJoinRequests(meetingId);

      return ok(
        status ? requests.filter((item) => item.status === status) : requests,
      );
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/join-requests/:joinRequestId",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      const item = getMeetingJoinRequests(meetingId).find(
        (requestItem) =>
          requestItem.joinRequestId === Number(params.joinRequestId),
      );

      return item
        ? ok({ ...item, ...getPersonalDetail(item.userId, item.nickname) })
        : fail("JOIN_REQUEST_NOT_FOUND", "가입 신청을 찾을 수 없습니다.", 404);
    },
  ),

  ...(["approve", "reject", "pending"] as const).map((action) =>
    http.patch(
      `*/api/v1/meetings/:meetingId/join-requests/:joinRequestId/${action}`,
      ({ params, request }) => {
        const meetingId = Number(params.meetingId);
        if (!getMockUserId(request)) return createUnauthorizedResponse();
        if (!isMeetingHost(request, meetingId)) {
          return fail(
            "MEETING_HOST_REQUIRED",
            "팀장만 처리할 수 있습니다.",
            403,
          );
        }

        const joinRequestId = Number(params.joinRequestId);
        const item = getMeetingJoinRequests(meetingId).find(
          (requestItem) => requestItem.joinRequestId === joinRequestId,
        );
        if (!item) {
          return fail(
            "JOIN_REQUEST_NOT_FOUND",
            "가입 신청을 찾을 수 없습니다.",
            404,
          );
        }

        const nextStatus =
          action === "approve"
            ? "APPROVED"
            : action === "reject"
              ? "REJECTED"
              : "PENDING";
        const staticRequests = joinRequestsByMeetingId.get(meetingId) ?? [];
        const isStaticRequest = staticRequests.some(
          (requestItem) => requestItem.joinRequestId === joinRequestId,
        );

        if (isStaticRequest) {
          item.status = nextStatus;
        } else {
          staticRequests.push({ ...item, status: nextStatus });
          joinRequestsByMeetingId.set(meetingId, staticRequests);
          updateMockPendingJoinRequest(joinRequestId, nextStatus);
        }

        if (action === "approve") {
          approveMockMeetingMember(meetingId, item.userId, item.nickname);
        }

        return ok({ ...item, status: nextStatus });
      },
    ),
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/members/:userId",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      const member = getMockMeetingMembers(meetingId).find(
        (item) => item.userId === Number(params.userId),
      );

      return member
        ? ok({
            ...getPersonalDetail(member.userId, member.nickname),
            role: member.role,
          })
        : fail("MEETING_MEMBER_NOT_FOUND", "멤버를 찾을 수 없습니다.", 404);
    },
  ),

  http.delete(
    "*/api/v1/meetings/:meetingId/members/:userId",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      const targetUserId = Number(params.userId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 내보낼 수 있습니다.", 403);
      }
      if (getMockMeetingRole(targetUserId, meetingId) === "HOST") {
        return fail(
          "MEETING_HOST_REMOVE_NOT_ALLOWED",
          "팀장은 내보낼 수 없습니다.",
          409,
        );
      }
      if (hasUpcomingConfirmedMockRecruit(meetingId, targetUserId)) {
        return fail(
          "MEETING_MEMBER_CONFIRMED_ACTIVITY_EXISTS",
          "확정된 진행 예정 활동이 있어 멤버를 내보낼 수 없습니다.",
          409,
        );
      }

      for (const participants of mockRecruitParticipantsByPostId.values()) {
        const participant = participants.find(
          (item) => item.userId === targetUserId,
        );
        if (participant?.participationStatus === "APPLIED") {
          participant.participationStatus = "CANCELLED";
        }
      }
      removeMockMeetingMember(meetingId, targetUserId);
      return ok(null);
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/my/reviewable-activities",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      const reviewable = [...mockMeetingRecruitsByPostId.values()].flatMap(
        (recruit) => {
          const participant = (
            mockRecruitParticipantsByPostId.get(recruit.postId) ?? []
          ).find((item) => item.userId === userId);

          return recruit.meetingId === meetingId &&
            participant?.participationStatus === "COMPLETED"
            ? [
                {
                  reviewSourceType: "MEETING_RECRUIT" as const,
                  reviewSourceId: recruit.postId,
                  title: recruit.title,
                  activityStartAt: recruit.activityStartAt,
                  activityEndAt: recruit.activityEndAt,
                },
              ]
            : [];
        },
      );

      return ok(reviewable);
    },
  ),

  http.post(
    "*/api/v1/meetings/:meetingId/posts/images/presigned-url",
    ({ request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const objectKey = `posts/${userId}/${crypto.randomUUID()}.jpg`;
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

  http.get(
    "*/api/v1/meetings/:meetingId/posts/recruits",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      return ok(
        [...mockMeetingRecruitsByPostId.values()]
          .filter((recruit) => recruit.meetingId === meetingId)
          .map(getManagedRecruit),
      );
    },
  ),

  http.post(
    "*/api/v1/meetings/:meetingId/posts/recruits",
    async ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      const meeting = getMockMeeting(meetingId);
      if (!meeting)
        return fail("MEETING_NOT_FOUND", "모임을 찾을 수 없습니다.", 404);
      if (getMockMeetingRole(userId, meetingId) !== "HOST") {
        return fail("MEETING_HOST_REQUIRED", "팀장만 작성할 수 있습니다.", 403);
      }
      if (meeting.volunteerPostingId !== null) {
        return fail(
          "RECRUIT_NOT_ALLOWED_FOR_POSTING_BASED_MEETING",
          "봉사공고 기반 모임에서는 모집공고를 작성할 수 없습니다.",
          409,
        );
      }

      const body = (await request.json()) as MeetingRecruitRequest;
      const postId = nextPostId++;
      const now = new Date().toISOString().slice(0, 19);
      const recruit = {
        ...body,
        postId,
        meetingId,
        meetingName: meeting.name,
        authorId: userId,
        authorNickname: getMockUserById(userId)?.nickname ?? "가더",
        regionName: meeting.regionName,
        likeCount: 0,
        commentCount: 0,
        appliedCount: 0,
        participationStatus: null,
        participationAction: "APPLY" as const,
        applicationOpen: true,
        full: false,
        canEdit: true,
        canDelete: true,
        createdAt: now,
        updatedAt: now,
        confirmationStatus: "UNCONFIRMED" as const,
        confirmedAt: null,
      };
      mockMeetingRecruitsByPostId.set(postId, recruit);
      mockRecruitParticipantsByPostId.set(postId, []);
      upsertMockMeetingRecruitPost({
        postId,
        meetingId,
        title: recruit.title,
        content: recruit.content,
      });

      return ok(getViewerRecruit(recruit, userId), { status: 201 });
    },
  ),

  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit",
    async ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      const recruit = getRecruit(Number(params.postId), meetingId);
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      if (getMockMeetingRole(userId, meetingId) !== "HOST") {
        return fail("MEETING_HOST_REQUIRED", "팀장만 수정할 수 있습니다.", 403);
      }
      if (!recruit.canEdit) {
        return fail(
          "RECRUIT_EDIT_NOT_ALLOWED",
          "수정할 수 없는 공고입니다.",
          409,
        );
      }

      Object.assign(recruit, (await request.json()) as MeetingRecruitRequest, {
        updatedAt: new Date().toISOString().slice(0, 19),
      });
      upsertMockMeetingRecruitPost({
        postId: recruit.postId,
        meetingId,
        title: recruit.title,
        content: recruit.content,
      });
      return ok(getViewerRecruit(recruit, userId));
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      const recruit = getRecruit(Number(params.postId), meetingId);
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);

      const userId = getMockUserId(request);
      if (
        !recruit.external &&
        (!userId || !isMockMeetingMember(userId, meetingId))
      ) {
        return fail("MEETING_MEMBER_REQUIRED", "모임원 전용 공고입니다.", 403);
      }

      return ok(getViewerRecruit(recruit, userId));
    },
  ),

  http.post(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participation",
    ({ params, request }) => {
      const userId = getMockUserId(request);
      if (!userId) return createUnauthorizedResponse();

      const meetingId = Number(params.meetingId);
      const recruit = getRecruit(Number(params.postId), meetingId);
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      if (!recruit.external && !isMockMeetingMember(userId, meetingId)) {
        return fail("MEETING_MEMBER_REQUIRED", "모임원 전용 공고입니다.", 403);
      }

      applyMockAutomaticConfirmation(recruit);
      const participants =
        mockRecruitParticipantsByPostId.get(recruit.postId) ?? [];
      let participant = participants.find((item) => item.userId === userId);
      const action = getParticipationAction(recruit, participant);
      if (action === "NONE") {
        return fail(
          "RECRUIT_PARTICIPATION_NOT_ALLOWED",
          "현재는 신청 상태를 변경할 수 없습니다.",
          409,
        );
      }

      if (action === "APPLY") {
        if (participant) {
          participant.participationStatus = "APPLIED";
          participant.attendanceStatus = "UNSET";
        } else {
          participant = {
            participationId: getNextMockRecruitParticipationId(),
            userId,
            nickname: getMockUserById(userId)?.nickname ?? `사용자 ${userId}`,
            applicantType: isMockMeetingMember(userId, meetingId)
              ? "MEMBER"
              : "EXTERNAL",
            participationStatus: "APPLIED",
            attendanceStatus: "UNSET",
            appliedAt: new Date().toISOString().slice(0, 19),
          };
          participants.push(participant);
          mockRecruitParticipantsByPostId.set(recruit.postId, participants);
        }
      } else {
        participant!.participationStatus = "CANCELLED";
      }

      syncMockRecruitCounts(recruit);
      return ok({
        participationId: participant!.participationId,
        participationStatus: participant!.participationStatus,
        participationAction: getParticipationAction(recruit, participant),
        appliedCount: getMockRecruitAppliedCount(recruit.postId),
      });
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      const recruit = getRecruit(Number(params.postId), meetingId);
      if (!recruit)
        return fail("POST_NOT_FOUND", "공고를 찾을 수 없습니다.", 404);
      applyMockAutomaticConfirmation(recruit);

      return ok({
        postId: recruit.postId,
        confirmationStatus: recruit.confirmationStatus,
        confirmedAt: recruit.confirmedAt,
        activityStartAt: recruit.activityStartAt,
        activityEndAt: recruit.activityEndAt,
        participants: mockRecruitParticipantsByPostId.get(recruit.postId) ?? [],
      });
    },
  ),

  http.get(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/:participationId",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 조회할 수 있습니다.", 403);
      }

      const participant = (
        mockRecruitParticipantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));

      return participant
        ? ok({
            ...participant,
            ...getPersonalDetail(participant.userId, participant.nickname),
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
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 반려할 수 있습니다.", 403);
      }

      const recruit = getRecruit(Number(params.postId), meetingId);
      const participant = (
        mockRecruitParticipantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));
      if (!recruit || !participant) {
        return fail(
          "RECRUIT_PARTICIPATION_NOT_FOUND",
          "신청자를 찾을 수 없습니다.",
          404,
        );
      }
      if (
        recruit.confirmationStatus === "CONFIRMED" ||
        participant.participationStatus !== "APPLIED"
      ) {
        return fail(
          "RECRUIT_REJECT_NOT_ALLOWED",
          "확정 전 신청자만 반려할 수 있습니다.",
          409,
        );
      }

      participant.participationStatus = "REJECTED";
      syncMockRecruitCounts(recruit);
      return ok({
        participationId: participant.participationId,
        participationStatus: "REJECTED",
        attendanceStatus: "UNSET",
        updatedAt: new Date().toISOString().slice(0, 19),
      });
    },
  ),

  http.patch(
    "*/api/v1/meetings/:meetingId/posts/:postId/recruit/participants/confirm",
    ({ params, request }) => {
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail("MEETING_HOST_REQUIRED", "팀장만 확정할 수 있습니다.", 403);
      }

      const postId = Number(params.postId);
      const recruit = getRecruit(postId, meetingId);
      const participants = mockRecruitParticipantsByPostId.get(postId) ?? [];
      const applied = participants.filter(
        (item) => item.participationStatus === "APPLIED",
      );
      if (
        !recruit ||
        recruit.confirmationStatus === "CONFIRMED" ||
        applied.length === 0
      ) {
        return fail(
          "RECRUIT_CONFIRM_NOT_ALLOWED",
          "확정할 신청자가 없습니다.",
          409,
        );
      }

      applied.forEach((item) => {
        item.participationStatus = "CONFIRMED";
      });
      recruit.confirmationStatus = "CONFIRMED";
      recruit.confirmedAt = new Date().toISOString().slice(0, 19);
      recruit.applicationOpen = false;
      recruit.canEdit = false;
      syncMockRecruitCounts(recruit);

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
      const meetingId = Number(params.meetingId);
      if (!getMockUserId(request)) return createUnauthorizedResponse();
      if (!isMeetingHost(request, meetingId)) {
        return fail(
          "MEETING_HOST_REQUIRED",
          "팀장만 출석을 처리할 수 있습니다.",
          403,
        );
      }

      const recruit = getRecruit(Number(params.postId), meetingId);
      const participant = (
        mockRecruitParticipantsByPostId.get(Number(params.postId)) ?? []
      ).find((item) => item.participationId === Number(params.participationId));
      if (!recruit || !participant) {
        return fail(
          "RECRUIT_PARTICIPATION_NOT_FOUND",
          "신청자를 찾을 수 없습니다.",
          404,
        );
      }
      if (
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
        return fail(
          "RECRUIT_REVIEW_EXISTS",
          "출석을 변경하려면 작성한 활동 후기를 먼저 삭제해 주세요.",
          409,
        );
      }

      const previousAttendance = participant.attendanceStatus;
      const recognizedMinutes = recruit.timeRecognized
        ? (recruit.recognizedMinutes ?? 0)
        : 0;
      const recognizedDelta =
        previousAttendance === body.attendanceStatus
          ? 0
          : body.attendanceStatus === "PRESENT"
            ? recognizedMinutes
            : previousAttendance === "PRESENT"
              ? -recognizedMinutes
              : 0;

      participant.attendanceStatus = body.attendanceStatus;
      participant.participationStatus =
        body.attendanceStatus === "PRESENT" ? "COMPLETED" : "CONFIRMED";
      recognizedMinutesByUserId.set(
        participant.userId,
        Math.max(
          0,
          (recognizedMinutesByUserId.get(participant.userId) ?? 720) +
            recognizedDelta,
        ),
      );

      return ok({
        participationId: participant.participationId,
        participationStatus: participant.participationStatus,
        attendanceStatus: participant.attendanceStatus,
        recognizedMinutesApplied: recognizedDelta,
        updatedAt: new Date().toISOString().slice(0, 19),
      });
    },
  ),
];
