import CommentIcon from "@/assets/icons/Comment.svg";
import HeartIcon from "@/assets/icons/Heart.svg";

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
      <div className="flex w-full items-start justify-between gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-stroke text-[14px] leading-4 font-normal text-text">
            {getInitial(post.authorNickname)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[16px] leading-5 font-medium text-text">
              {post.authorNickname}
            </p>
            <p className="mt-0.5 text-[14px] leading-5 font-normal text-text-gray-100">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-[30px] bg-[#DCECDF] px-3.5 py-1 text-[14px] leading-4 font-normal text-button">
          {POST_TYPE_LABELS[post.type]}
        </span>
      </div>
      <h3 className="mt-4 line-clamp-1 text-[15px] leading-5 font-semibold text-text">
        {post.title}
      </h3>
      <div className="mt-3 flex items-start gap-3 text-[15px] leading-5 font-normal text-text-gray-500">
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
        {/* 게시글에 대한 라우트가 정해지면 GET /api/v1/meetings/{meetingId}/posts/{postId}로 연결한다. */}
        <span
          aria-hidden="true"
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
        </span>
      </div>
      <div
        aria-hidden="true"
        className="mt-5 h-[150px] w-full rounded-[12px] bg-stroke"
      />{" "}
      {/* 사진 추후 연결 예정 */}
      <div className="mt-5 flex items-center gap-4 text-text-gray-100">
        <span className="inline-flex items-center gap-1">
          <img
            aria-hidden="true"
            src={HeartIcon}
            alt=""
            className="h-3 w-[13.333px]"
          />
          <span className="text-[14px] leading-4 font-normal">
            {post.likeCount}
          </span>
        </span>
        <span className="inline-flex items-center gap-1">
          <img aria-hidden="true" src={CommentIcon} alt="" className="size-4" />
          <span className="text-[14px] leading-4 font-normal">
            {post.commentCount}
          </span>
        </span>
      </div>
    </article>
  );
}
