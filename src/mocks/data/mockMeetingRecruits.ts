import type {
  MeetingRecruitDetail,
  RecruitParticipantSummary,
} from "@/features/team/types/meetingRecruit.types";
import type { PostingListItem } from "@/features/volunteer/types/volunteer.types";

export type MockMeetingRecruit = MeetingRecruitDetail;

function formatLocalDateTime(offsetDays: number, time: string) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${time}`;
}

function createRecruit(
  overrides: Partial<MockMeetingRecruit> &
    Pick<MockMeetingRecruit, "postId" | "title">,
): MockMeetingRecruit {
  const { postId, title, ...rest } = overrides;
  const activityStartAt = formatLocalDateTime(5, "09:00:00");
  const activityEndAt = formatLocalDateTime(5, "12:00:00");

  return {
    postId,
    meetingId: 10,
    meetingName: "[QA] 자유모임 운영 테스트",
    title,
    content: "자유 모임에서 직접 만든 봉사 모집공고입니다.",
    participationCondition: "만 14세 이상, 편한 복장 필수",
    authorId: 1,
    authorNickname: "가더",
    regionId: 32,
    regionName: "마포구",
    place: "서울 마포구 월드컵공원",
    activityStartAt,
    activityEndAt,
    maxParticipants: 10,
    categories: ["ENVIRONMENT"],
    timeRecognized: true,
    recognizedMinutes: 180,
    applyDeadlineAt: formatLocalDateTime(3, "23:59:59"),
    external: true,
    likeCount: 0,
    commentCount: 0,
    appliedCount: 0,
    participationStatus: null,
    participationAction: "APPLY",
    applicationOpen: true,
    full: false,
    canEdit: true,
    canDelete: true,
    createdAt: formatLocalDateTime(-7, "12:00:00"),
    updatedAt: formatLocalDateTime(-7, "12:00:00"),
    confirmationStatus: "UNCONFIRMED",
    confirmedAt: null,
    ...rest,
  };
}

export const mockMeetingRecruitsByPostId = new Map<number, MockMeetingRecruit>([
  [
    101,
    createRecruit({
      postId: 101,
      title: "[QA] 외부 공개 모집중",
      external: true,
      categories: ["ENVIRONMENT", "COMMUNITY", "WELFARE"],
    }),
  ],
  [
    102,
    createRecruit({
      postId: 102,
      title: "[QA] 모임원 전용 모집중",
      external: false,
      activityStartAt: formatLocalDateTime(7, "10:00:00"),
      activityEndAt: formatLocalDateTime(7, "13:00:00"),
      applyDeadlineAt: formatLocalDateTime(5, "23:59:59"),
    }),
  ],
  [
    103,
    createRecruit({
      postId: 103,
      title: "[QA] 확정 완료·활동 전",
      activityStartAt: formatLocalDateTime(1, "09:00:00"),
      activityEndAt: formatLocalDateTime(1, "12:00:00"),
      applyDeadlineAt: formatLocalDateTime(-1, "23:59:59"),
      applicationOpen: false,
      canEdit: false,
      confirmationStatus: "CONFIRMED",
      confirmedAt: formatLocalDateTime(-1, "23:59:59"),
      participationAction: "NONE",
    }),
  ],
  [
    104,
    createRecruit({
      postId: 104,
      title: "[QA] 활동 종료·출석 처리",
      activityStartAt: formatLocalDateTime(-1, "09:00:00"),
      activityEndAt: formatLocalDateTime(-1, "12:00:00"),
      applyDeadlineAt: formatLocalDateTime(-3, "23:59:59"),
      applicationOpen: false,
      canEdit: false,
      confirmationStatus: "CONFIRMED",
      confirmedAt: formatLocalDateTime(-3, "23:59:59"),
      participationAction: "NONE",
    }),
  ],
  [
    105,
    createRecruit({
      postId: 105,
      title: "[QA] 마감 후 자동 확정",
      activityStartAt: formatLocalDateTime(2, "09:00:00"),
      activityEndAt: formatLocalDateTime(2, "12:00:00"),
      applyDeadlineAt: formatLocalDateTime(-1, "23:59:59"),
      applicationOpen: false,
      canEdit: false,
      participationAction: "NONE",
    }),
  ],
  [
    106,
    createRecruit({
      postId: 106,
      title: "[QA] 후기 작성 가능 활동",
      activityStartAt: formatLocalDateTime(-5, "10:00:00"),
      activityEndAt: formatLocalDateTime(-5, "12:00:00"),
      applyDeadlineAt: formatLocalDateTime(-7, "23:59:59"),
      applicationOpen: false,
      canEdit: false,
      confirmationStatus: "CONFIRMED",
      confirmedAt: formatLocalDateTime(-7, "23:59:59"),
      participationAction: "NONE",
    }),
  ],
]);

export const mockRecruitParticipantsByPostId = new Map<
  number,
  RecruitParticipantSummary[]
>([
  [
    101,
    [
      {
        participationId: 1011,
        userId: 102,
        nickname: "팀원 2",
        applicantType: "MEMBER",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-1, "12:00:00"),
      },
      {
        participationId: 1012,
        userId: 301,
        nickname: "외부 신청자",
        applicantType: "EXTERNAL",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-1, "13:00:00"),
      },
    ],
  ],
  [
    102,
    [
      {
        participationId: 1021,
        userId: 103,
        nickname: "팀원 3",
        applicantType: "MEMBER",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-1, "14:00:00"),
      },
    ],
  ],
  [
    103,
    [
      {
        participationId: 1031,
        userId: 101,
        nickname: "팀원 1",
        applicantType: "MEMBER",
        participationStatus: "CONFIRMED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-4, "12:00:00"),
      },
    ],
  ],
  [
    104,
    [
      {
        participationId: 1041,
        userId: 1,
        nickname: "가더",
        applicantType: "MEMBER",
        participationStatus: "CONFIRMED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-7, "12:00:00"),
      },
      {
        participationId: 1042,
        userId: 102,
        nickname: "출석 완료 팀원",
        applicantType: "MEMBER",
        participationStatus: "COMPLETED",
        attendanceStatus: "PRESENT",
        appliedAt: formatLocalDateTime(-7, "13:00:00"),
      },
      {
        participationId: 1043,
        userId: 301,
        nickname: "불참 참가자",
        applicantType: "EXTERNAL",
        participationStatus: "CONFIRMED",
        attendanceStatus: "ABSENT",
        appliedAt: formatLocalDateTime(-7, "14:00:00"),
      },
      {
        participationId: 1044,
        userId: 302,
        nickname: "후기 작성 참가자",
        applicantType: "EXTERNAL",
        participationStatus: "REVIEWED",
        attendanceStatus: "PRESENT",
        appliedAt: formatLocalDateTime(-7, "15:00:00"),
      },
    ],
  ],
  [
    105,
    [
      {
        participationId: 1051,
        userId: 103,
        nickname: "팀원 3",
        applicantType: "MEMBER",
        participationStatus: "APPLIED",
        attendanceStatus: "UNSET",
        appliedAt: formatLocalDateTime(-2, "12:00:00"),
      },
    ],
  ],
  [
    106,
    [
      {
        participationId: 1061,
        userId: 1,
        nickname: "가더",
        applicantType: "MEMBER",
        participationStatus: "COMPLETED",
        attendanceStatus: "PRESENT",
        appliedAt: formatLocalDateTime(-10, "12:00:00"),
      },
    ],
  ],
]);

let nextParticipationId = 2000;

export function getNextMockRecruitParticipationId() {
  return nextParticipationId++;
}

export function getMockRecruitAppliedCount(postId: number) {
  return (mockRecruitParticipantsByPostId.get(postId) ?? []).filter(
    ({ participationStatus }) =>
      participationStatus !== "REJECTED" && participationStatus !== "CANCELLED",
  ).length;
}

export function syncMockRecruitCounts(recruit: MockMeetingRecruit) {
  recruit.appliedCount = getMockRecruitAppliedCount(recruit.postId);
  recruit.full = recruit.appliedCount >= recruit.maxParticipants;
}

export function applyMockAutomaticConfirmation(recruit: MockMeetingRecruit) {
  if (
    recruit.confirmationStatus === "CONFIRMED" ||
    new Date(recruit.applyDeadlineAt).getTime() > Date.now()
  ) {
    return;
  }

  const applied = (
    mockRecruitParticipantsByPostId.get(recruit.postId) ?? []
  ).filter(({ participationStatus }) => participationStatus === "APPLIED");

  if (applied.length === 0) {
    return;
  }

  applied.forEach((participant) => {
    participant.participationStatus = "CONFIRMED";
  });
  recruit.confirmationStatus = "CONFIRMED";
  recruit.confirmedAt = recruit.applyDeadlineAt;
  recruit.participationAction = "NONE";
  syncMockRecruitCounts(recruit);
}

export function hasUpcomingConfirmedMockRecruit(
  meetingId: number,
  userId?: number,
) {
  return [...mockMeetingRecruitsByPostId.values()].some((recruit) => {
    if (
      recruit.meetingId !== meetingId ||
      new Date(recruit.activityEndAt).getTime() <= Date.now()
    ) {
      return false;
    }

    return (mockRecruitParticipantsByPostId.get(recruit.postId) ?? []).some(
      (participant) =>
        participant.participationStatus === "CONFIRMED" &&
        (userId === undefined || participant.userId === userId),
    );
  });
}

export function getExternalMockMeetingRecruitListItems(): PostingListItem[] {
  return [...mockMeetingRecruitsByPostId.values()]
    .filter((recruit) => recruit.external)
    .map((recruit) => {
      applyMockAutomaticConfirmation(recruit);
      syncMockRecruitCounts(recruit);

      return {
        sourceType: "MEETING_RECRUIT",
        id: recruit.postId,
        meetingId: recruit.meetingId,
        title: recruit.title,
        organizationName: recruit.meetingName,
        thumbnailUrl: "/src/assets/icons/Temp-volunteer-posting.svg",
        regionId: recruit.regionId,
        regionName: recruit.regionName,
        place: recruit.place,
        activityStartAt: recruit.activityStartAt,
        activityEndAt: recruit.activityEndAt,
        applyDeadlineAt: recruit.applyDeadlineAt,
        maxParticipants: recruit.maxParticipants,
        appliedCount: recruit.appliedCount,
        categories: recruit.categories,
        status: recruit.applicationOpen ? "RECRUITING" : "CLOSED",
      };
    });
}
