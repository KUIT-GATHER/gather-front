import { useParams } from "react-router";

import { VolunteerPostingDetail } from "@/features/volunteer/components/detail/VolunteerPostingDetail";
import { ErrorState } from "@/shared/ui/ErrorState";
import PageContainer from "@/shared/ui/PageContainer";

export function VolunteerDetailPage() {
  const { volunteerId } = useParams();
  const postingId = Number(volunteerId);
  const hasValidPostingId = Number.isInteger(postingId) && postingId > 0;

  return (
    <PageContainer size="narrow" className="min-h-dvh bg-bg">
      {hasValidPostingId ? (
        <VolunteerPostingDetail postingId={postingId} />
      ) : (
        <ErrorState
          className="min-h-dvh justify-center"
          title="잘못된 봉사 공고 주소예요"
          description="봉사 공고 주소를 다시 확인해 주세요."
        />
      )}
    </PageContainer>
  );
}
