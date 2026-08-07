import { useParams } from "react-router";

import { MeetingRecruitDetailScreen } from "@/features/team/components/recruit/MeetingRecruitDetailScreen";
import { ErrorState } from "@/shared/ui/ErrorState";

export function MeetingRecruitDetailPage() {
  const { meetingId: meetingIdParam, postId: postIdParam } = useParams();
  const meetingId = Number(meetingIdParam);
  const postId = Number(postIdParam);
  if (
    !Number.isInteger(meetingId) ||
    meetingId <= 0 ||
    !Number.isInteger(postId) ||
    postId <= 0
  ) {
    return (
      <ErrorState
        className="min-h-dvh"
        title="잘못된 봉사 공고 주소예요"
        description="봉사 공고 주소를 다시 확인해 주세요."
      />
    );
  }
  return <MeetingRecruitDetailScreen meetingId={meetingId} postId={postId} />;
}
