import mockMeetingImageOne from "@/assets/icons/Temp-volunteer-posting.svg";
import mockMeetingImageThree from "@/assets/onboarding/onboarding-step2-center.svg";
import mockMeetingImageTwo from "@/assets/onboarding/onboarding-step1-center.svg";
import type { MeetingManageImage } from "@/features/team/types/meetingImage.types";

const initialMeetingImageUrls = new Map<number, string[]>([
  [1, [mockMeetingImageOne, mockMeetingImageTwo, mockMeetingImageThree]],
  [2, [mockMeetingImageOne]],
  [10, [mockMeetingImageOne, mockMeetingImageTwo]],
]);

const meetingManageImagesByMeetingId = new Map<number, MeetingManageImage[]>(
  [...initialMeetingImageUrls].map(([meetingId, imageUrls]) => [
    meetingId,
    imageUrls.map((imageUrl, sortOrder) => ({
      objectKey: `meetings/${meetingId}/existing-${sortOrder + 1}.jpg`,
      imageUrl,
      sortOrder,
    })),
  ]),
);

function getSortedMockMeetingImages(meetingId: number) {
  return [...(meetingManageImagesByMeetingId.get(meetingId) ?? [])].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
}

export function getMockMeetingManageImages(meetingId: number) {
  return getSortedMockMeetingImages(meetingId);
}

export function getMockMeetingImageUrls(meetingId: number) {
  return getSortedMockMeetingImages(meetingId).map((image) => image.imageUrl);
}

export function resolveMockMeetingThumbnail(meetingId: number) {
  return getSortedMockMeetingImages(meetingId)[0]?.imageUrl ?? null;
}

export function replaceMockMeetingImages(
  meetingId: number,
  images: MeetingManageImage[],
) {
  meetingManageImagesByMeetingId.set(meetingId, images);
}
