import { CircleAlert, FileQuestionMark } from "lucide-react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";

import { env } from "@/shared/config/env";
import { ErrorState } from "@/shared/ui/ErrorState";
import PageContainer from "@/shared/ui/PageContainer";

export function RootRouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (env.IS_DEV) {
    console.error("Route rendering failed", error);
  }

  const isNotFoundResponse =
    isRouteErrorResponse(error) && error.status === 404;
  const isJavaScriptError = error instanceof Error;

  const title = isNotFoundResponse
    ? "페이지를 찾을 수 없어요"
    : "문제가 발생했어요";
  const description = isNotFoundResponse
    ? "요청한 페이지가 삭제되었거나 주소가 변경되었을 수 있어요."
    : isJavaScriptError
    
      ? "잠시 후 다시 시도해 주세요."
      : "예상하지 못한 오류가 발생했어요. 잠시 후 다시 시도해 주세요.";

  const handleSecondaryAction = () => {
    if (isNotFoundResponse && window.history.length > 1) {
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
          title={title}
          description={description}
          icon={
            isNotFoundResponse ? (
              <FileQuestionMark className="size-7" />
            ) : (
              <CircleAlert className="size-7" />
            )
          }
          primaryAction={
            isNotFoundResponse
              ? {
                  label: "홈으로 이동",
                  onClick: () => navigate("/home"),
                }
              : {
                  label: "새로고침",
                  onClick: () => window.location.reload(),
                }
          }
          secondaryAction={{
            label: isNotFoundResponse ? "이전 페이지" : "홈으로 이동",
            onClick: handleSecondaryAction,
          }}
        />
      </PageContainer>
    </main>
  );
}
