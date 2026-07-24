import { Heart, MessageSquare } from "lucide-react";

import type {
  MeetingPostSummary,
  MeetingPostType,
} from "@/features/team/types/team.types";

const POST_TYPE_LABELS: Record<MeetingPostType, string> = {
  NOTICE: "공지",
  REVIEW: "후기",
  RECRUIT: "모집",
  FREE: "자유",
};

function getInitial(name: string) {
  return name.trim().slice(0, 1) || "?";
}

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

type SharedMeetingBoardPostCardProps = {
  post: MeetingPostSummary;
};

export function SharedMeetingBoardPostCard({
  post,
}: SharedMeetingBoardPostCardProps) {
  return (
    <article className="rounded-xl border border-stroke bg-white px-4.5 py-5">
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-stroke text-[18px] leading-5 font-medium text-text-gray-500">
          {getInitial(post.authorNickname)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[18px] leading-6 font-semibold text-text">
                {post.authorNickname}
              </p>
              <p className="mt-0.5 text-[18px] leading-6 font-medium text-text-gray-500">
                {formatPostDate(post.createdAt)}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-point-green/20 px-4 py-2 text-[17px] leading-5 font-medium text-button">
              {POST_TYPE_LABELS[post.type]}
            </span>
          </div>

          <h3 className="mt-7 line-clamp-1 text-[21px] leading-7 font-semibold text-text">
            {post.title}
          </h3>
          <div className="mt-3 flex items-start gap-3 text-[19px] leading-7 text-text-gray-500">
            <p className="line-clamp-1 min-w-0 flex-1">{post.content}</p>
            {/* TODO: 게시글 상세 라우트가 정해지면 GET /api/v1/meetings/{meetingId}/posts/{postId}로 연결한다. */}
            <span
              aria-hidden="true"
              className="shrink-0 text-text underline underline-offset-3"
            >
              더보기
            </span>
          </div>

          <div className="mt-8 flex items-center gap-6 text-[19px] leading-5 text-text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Heart aria-hidden="true" className="size-6" />
              {post.likeCount}
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageSquare aria-hidden="true" className="size-6" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
