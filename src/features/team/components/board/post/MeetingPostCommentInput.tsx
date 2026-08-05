import type { FormEvent } from "react";

import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";

type MeetingPostCommentInputProps = {
  value: string;
  canSubmit: boolean;
  isPending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function MeetingPostCommentInput({
  value,
  canSubmit,
  isPending,
  onChange,
  onSubmit,
}: MeetingPostCommentInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className={cn(
        "fixed bottom-0 left-1/2 z-40 flex w-full max-w-app -translate-x-1/2 gap-3 border-t border-stroke bg-white px-5.5 pt-5",
        "pb-[calc(env(safe-area-inset-bottom)+1.25rem)]",
      )}
      onSubmit={handleSubmit}
    >
      <Input
        aria-label="댓글 입력"
        maxLength={500}
        value={value}
        placeholder="댓글을 입력하세요"
        className="h-11 min-w-0 flex-1 px-4.5 text-[15px] leading-5 font-medium focus:border-stroke"
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="submit"
        variant="primaryOutline"
        size="medium"
        disabled={!canSubmit}
        className="h-11 w-14.5 shrink-0 rounded-xl border-text-gray-400 bg-white px-0 text-[15px] leading-5 font-medium hover:bg-text-gray-400 hover:text-text2 disabled:border-text-gray-400 disabled:bg-white disabled:text-text-gray-400 disabled:hover:bg-white"
      >
        {isPending ? "등록 중" : "등록"}
      </Button>
    </form>
  );
}
