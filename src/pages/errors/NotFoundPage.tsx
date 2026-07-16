import { FileQuestionMark } from "lucide-react";
import { useNavigate } from "react-router";

import { ErrorState } from "@/shared/ui/ErrorState";
import PageContainer from "@/shared/ui/PageContainer";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/home");
  };

  return (
    <main>
      <PageContainer
        size="narrow"
        className="flex min-h-dvh items-center justify-center py-[calc(env(safe-area-inset-top)+3rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]"
      >
        <ErrorState
          headingLevel="h1"
          title="페이지를 찾을 수 없어요"
          description="요청한 페이지가 삭제되었거나 주소가 변경되었을 수 있어요."
          icon={<FileQuestionMark className="size-7" />}
          primaryAction={{
            label: "홈으로 이동",
            onClick: () => navigate("/home"),
          }}
          secondaryAction={{
            label: "이전 페이지",
            onClick: handleGoBack,
          }}
        />
      </PageContainer>
    </main>
  );
}
