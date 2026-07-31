type MeetingCreateResult = {
  meetingId: number;
};

export async function ensureMeetingCreated({
  createdMeetingId,
  createMeeting,
}: {
  createdMeetingId: number | null;
  createMeeting: () => Promise<MeetingCreateResult>;
}) {
  if (createdMeetingId !== null) {
    return createdMeetingId;
  }

  const meeting = await createMeeting();

  return meeting.meetingId;
}
