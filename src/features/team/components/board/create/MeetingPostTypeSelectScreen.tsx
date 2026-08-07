import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { MobileBottomNavigation } from "@/app/navigation/MobileBottomNavigation";
import type { MeetingPostType } from "@/features/team/types/team.types";
import { getWritableMeetingPostTypes } from "@/features/team/lib/meetingPostPermissions";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import PageContainer from "@/shared/ui/PageContainer";
import PageHeader from "@/shared/ui/PageHeader";

type MeetingPostTypeSelectScreenProps = {
  meetingId: number;
  isHost: boolean;
  isPostingBased: boolean;
};

const options: Array<{
  type: MeetingPostType;
  title: string;
  description: string;
  badge?: string;
}> = [
  {
    type: "NOTICE",
    title: "공지",
    description: "중요한 내용을 팀 전체에 알려요",
  },
  {
    type: "RECRUIT",
    title: "모집 공고",
    description: "새로운 봉사활동을 모집해요",
  },
  {
    type: "REVIEW",
    title: "활동 후기 글",
    description: "완료한 활동의 후기를 남겨요",
    badge: "참여 완료자만",
  },
  {
    type: "FREE",
    title: "자유 게시글",
    description: "팀원들과 자유롭게 이야기해요",
  },
];

export function MeetingPostTypeSelectScreen({
  meetingId,
  isHost,
  isPostingBased,
}: MeetingPostTypeSelectScreenProps) {
  const navigate = useNavigate();
  const writableTypes = getWritableMeetingPostTypes(isHost, isPostingBased);
  const availableOptions = options.filter((option) =>
    writableTypes.includes(option.type),
  );
  const [selected, setSelected] = useState<MeetingPostType | null>(null);

  const handleNext = () => {
    if (!selected) return;
    navigate(
      selected === "RECRUIT"
        ? `/teams/${meetingId}/posts/recruits/new`
        : `/teams/${meetingId}/posts/new/${selected.toLowerCase()}`,
    );
  };

  return (
    <PageContainer className="min-h-dvh pb-32">
      <PageHeader title="글 작성" onBack={() => navigate(-1)} />
      <section className="pt-6">
        <h2 className="text-lg font-medium">
          게시글 유형<span className="text-point-red">*</span>
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {availableOptions.map((option) => {
            const active = selected === option.type;
            return (
              <button
                key={option.type}
                type="button"
                aria-pressed={active}
                className={cn(
                  "flex min-h-24 items-center gap-3 rounded-xl border bg-white px-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                  active ? "border-point-green" : "border-stroke",
                )}
                onClick={() => setSelected(option.type)}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    active ? "bg-point-green" : "bg-stroke",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-semibold">
                      {option.title}
                    </span>
                    {option.badge ? (
                      <span className="rounded-md bg-point-green/20 px-2 py-0.5 text-xs font-medium text-text-green-500">
                        {option.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-text-gray-300">
                    {option.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    active
                      ? "border-point-green bg-point-green"
                      : "border-stroke bg-white",
                  )}
                >
                  {active ? (
                    <span className="size-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            size="next"
            disabled={!selected}
            onClick={handleNext}
            rightIcon={<ChevronRight className="size-4" />}
          >
            다음
          </Button>
        </div>
      </section>
      <MobileBottomNavigation />
    </PageContainer>
  );
}
