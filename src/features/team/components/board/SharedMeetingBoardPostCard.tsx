import { Link } from "react-router";

import CommentIcon from "@/assets/icons/Comment.svg";
import HeartIcon from "@/assets/icons/Heart.svg";
import {
  MEETING_POST_TYPE_BADGE_CLASS_NAMES,
  MEETING_POST_TYPE_LABELS,
} from "@/features/team/constants/meetingPost.constants";
import type { MeetingPostSummary } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

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
  meetingId: number;
  post: MeetingPostSummary;
};

export function SharedMeetingBoardPostCard({
  meetingId,
  post,
}: SharedMeetingBoardPostCardProps) {
  return (
    <article className="rounded-xl border border-stroke bg-white px-3 pt-5 pb-3">
      <h3 className="line-clamp-1 text-[15px] leading-5 font-semibold text-text">
        {post.title}
      </h3>
      <div className="mt-2 flex items-start gap-3 text-[14px] leading-5 font-normal text-text-gray-400">
        <p
          className="line-clamp-1 min-w-0 flex-1"
          style={{
            background:
              "linear-gradient(90deg, #5E5E5D 0%, #676766 84.62%, #C4C4C2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {post.content}
        </p>
        <Link
          to={`/teams/${meetingId}/posts/${post.postId}`}
          className="shrink-0 text-text"
          style={{
            textDecorationLine: "underline",
            textDecorationSkipInk: "auto",
            textDecorationStyle: "solid",
            textDecorationThickness: "auto",
            textUnderlineOffset: "auto",
            textUnderlinePosition: "from-font",
          }}
        >
          더보기
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "shrink-0 rounded-[30px] px-2.5 py-1 text-[14px] leading-4 font-medium",
              MEETING_POST_TYPE_BADGE_CLASS_NAMES[post.type],
            )}
          >
            {MEETING_POST_TYPE_LABELS[post.type]}
          </span>
          <span className="shrink-0 text-[14px] leading-5 font-medium text-text-gray-100">
            {formatPostDate(post.createdAt)}
          </span>
          <span className="min-w-0 truncate text-[14px] leading-5 font-medium text-text">
            {post.authorNickname}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-text-gray-100">
          <span className="inline-flex items-center gap-1">
            <img
              aria-hidden="true"
              src={HeartIcon}
              alt=""
              className="h-3 w-[13.333px]"
            />
            <span className="text-[14px] leading-5 font-medium">
              {post.likeCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <img
              aria-hidden="true"
              src={CommentIcon}
              alt=""
              className="size-4"
            />
            <span className="text-[14px] leading-5 font-medium">
              {post.commentCount}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
