import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import { useMeetingHomeQuery } from "@/features/team/hooks/useMeetingHomeQuery";
import type { MeetingPostType } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";
import LoadingState from "@/shared/ui/LoadingState";
import PageHeader from "@/shared/ui/PageHeader";

type PostTypeInformation = {
  title: string;
  description: string;
  completionRequired?: boolean;
};

const POST_TYPE_INFORMATION: Record<MeetingPostType, PostTypeInformation> = {
  NOTICE: {
    title: "공지",
    description: "중요한 내용을 팀 전체에 알려요",
  },
  RECRUIT: {
    title: "모집 공고",
    description: "새로운 활동을 모집해요",
  },
  REVIEW: {
    title: "활동 후기",
    description: "완료한 활동의 후기를 남겨요",
    completionRequired: true,
  },
  FREE: {
    title: "자유 게시글",
    description: "팀원들과 자유롭게 이야기해요",
  },
};

const LEADER_POST_TYPES = [
  "NOTICE",
  "RECRUIT",
  "REVIEW",
  "FREE",
] satisfies readonly MeetingPostType[];

const MEMBER_POST_TYPES = [
  "REVIEW",
  "FREE",
] satisfies readonly MeetingPostType[];

export function TeamPostTypeSelectPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();

  const meetingId = Number(teamId);
  const hasValidMeetingId = Number.isInteger(meetingId) && meetingId > 0;
  const safeMeetingId = hasValidMeetingId ? meetingId : 0;

  const [selectedType, setSelectedType] = useState<MeetingPostType | null>(
    null,
  );

  const homeQuery = useMeetingHomeQuery(safeMeetingId, {
    enabled: hasValidMeetingId,
    isAuthenticated: true,
  });

  if (!hasValidMeetingId) {
    return <Navigate to="/teams" replace />;
  }

  if (homeQuery.isLoading) {
    return (
      <LoadingState
        label="모임 정보를 불러오는 중"
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
      />
    );
  }

  if (homeQuery.isError || !homeQuery.data) {
    return (
      <ErrorState
        className="mx-auto min-h-dvh max-w-app justify-center px-5.5"
        title="모임 정보를 불러오지 못했어요"
        description="잠시 후 다시 확인해 주세요."
        primaryAction={{
          label: "다시 시도",
          onClick: () => void homeQuery.refetch(),
        }}
      />
    );
  }

  const home = homeQuery.data;
  const isJoined = home.member || home.host;
  const isHost = home.host;

  if (!isJoined) {
    return <Navigate to={`/teams/${meetingId}/posts`} replace />;
  }

  const availablePostTypes = isHost ? LEADER_POST_TYPES : MEMBER_POST_TYPES;

  const roleLabel = isHost ? "팀장" : "팀원";

  const handleNext = () => {
    if (!selectedType) {
      return;
    }

    if (selectedType === "REVIEW") {
      navigate(`/teams/${meetingId}/posts/new/review`);
      return;
    }
    if (selectedType === "FREE") {
      navigate(`/teams/${meetingId}/posts/new/free`);
      return;
    }
    if (selectedType === "NOTICE") {
      navigate(`/teams/${meetingId}/posts/new/notice`);
      return;
    }
    if (selectedType === "RECRUIT") {
      navigate(`/teams/${meetingId}/posts/new/recruit`);
      return;
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-bg pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <PageHeader
        title="글 작성"
        onBack={() => navigate(-1)}
        sticky
        className="px-5.5"
        rightAction={
          <span
            className={cn(
              "shrink-0 rounded-lg border border-[#6d6970] px-2.5 py-0.75 text-[14px] leading-5",
              isHost ? "bg-[#6d6970] text-text2" : "bg-white text-[#6d6970]",
            )}
          >
            {roleLabel}
          </span>
        }
      />

      <main className="px-5.5 pt-7 pb-10">
        <h2 className="text-[16px] leading-6 font-semibold text-text">
          게시글 유형
          <span className="text-point-red">*</span>
        </h2>

        <div
          className="mt-3 flex flex-col gap-3"
          role="radiogroup"
          aria-label="게시글 유형"
        >
          {availablePostTypes.map((type) => {
            const information = POST_TYPE_INFORMATION[type];
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={cn(
                  "flex min-h-[72px] w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                  isSelected
                    ? "border-[#90D79D] bg-[#F8FBF8]"
                    : "border-stroke bg-white",
                )}
                onClick={() => setSelectedType(type)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    isSelected ? "bg-[#90D79D]" : "bg-stroke",
                  )}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] leading-5 font-semibold text-text">
                      {information.title}
                    </span>

                    {information.completionRequired ? (
                      <span className="rounded-full bg-[#DCECDF] text-[#5E5E5D] px-2 py-0.5 text-[10px] leading-4 font-medium">
                        참여 완료자만
                      </span>
                    ) : null}
                  </span>

                  <span className="mt-1 block text-[12px] leading-4 text-text-gray-400">
                    {information.description}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border",
                    isSelected
                      ? "border-[#90D79D] bg-[#90D79D]"
                      : "border-text-gray-200 bg-white",
                  )}
                >
                  {isSelected ? (
                    <span className="size-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            disabled={!selectedType}
            onClick={handleNext}
            className="h-10 px-6 text-[15px]"
          >
            다음
          </Button>
        </div>
      </main>

      <MobileBottomNavigation />
    </div>
  );
}
