import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import CommentIcon from "@/assets/icons/Comment.svg";
import FilledHeartIcon from "@/assets/icons/Filledheart.svg";
import UnfilledHeartIcon from "@/assets/icons/Unfilledheart.svg";
import { formatMeetingPostDate } from "@/features/team/lib/formatMeetingPostDate";
import type { MeetingPostSummary } from "@/features/team/types/team.types";
import { getPublicNickname } from "@/shared/types/user.types";

import { MeetingPostTypeBadge } from "../shared/MeetingPostTypeBadge";

type SharedMeetingBoardPostCardProps = {
  meetingId: number;
  post: MeetingPostSummary;
};

export function SharedMeetingBoardPostCard({
  meetingId,
  post,
}: SharedMeetingBoardPostCardProps) {
  const firstImageUrl = post.imageUrls[0];
  const postDetailPath = `/teams/${meetingId}/posts/${post.postId}`;
  const authorNickname = getPublicNickname(
    post.authorNickname,
    post.userStatus,
  );
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);

  useEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) return;

    const updateTruncatedState = () => {
      setIsContentTruncated(
        contentElement.scrollWidth > contentElement.clientWidth ||
          contentElement.scrollHeight > contentElement.clientHeight,
      );
    };

    updateTruncatedState();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateTruncatedState);

    resizeObserver?.observe(contentElement);
    window.addEventListener("resize", updateTruncatedState);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateTruncatedState);
    };
  }, [post.content]);

  return (
    <Link
      to={postDetailPath}
      className="block rounded-xl border border-stroke bg-white px-3 pt-5 pb-3 text-left transition hover:border-point-green hover:bg-[#f0f6f0] active:border-point-green active:bg-[#f0f6f0] focus:outline-none focus-visible:border-point-green focus-visible:bg-[#f0f6f0] focus-visible:ring-2 focus-visible:ring-point-green/30"
    >
      <h3 className="line-clamp-1 text-[15px] leading-5 font-semibold text-text">
        {post.title}
      </h3>
      <div className="mt-2 flex items-start gap-3 text-[14px] leading-5 font-normal text-text-gray-400">
        <p
          ref={contentRef}
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
        {isContentTruncated ? (
          <span
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
        ) : null}
      </div>

      {firstImageUrl ? (
        <img
          src={firstImageUrl}
          alt={`${post.title} 이미지`}
          className="mt-3 max-h-40 w-full rounded-xl object-contain"
        />
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MeetingPostTypeBadge
            type={post.type}
            className="shrink-0 text-[14px] font-medium"
          />
          <span className="shrink-0 text-[14px] leading-5 font-medium text-text-gray-100">
            {formatMeetingPostDate(post.createdAt)}
          </span>
          <span className="min-w-0 truncate text-[14px] leading-5 font-medium text-text">
            {authorNickname}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-text-gray-100">
          <span className="inline-flex items-center gap-1">
            <img
              aria-hidden="true"
              src={post.liked ? FilledHeartIcon : UnfilledHeartIcon}
              alt=""
              className="h-[16px] w-[16px]"
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
    </Link>
  );
}
