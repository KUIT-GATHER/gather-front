import type { EditableMeetingPostType } from "@/features/team/types/meetingPost.types";
import type { MeetingPost } from "@/features/team/types/team.types";

const saveTargetByType: Record<EditableMeetingPostType, string> = {
  NOTICE: "공지",
  REVIEW: "활동 후기",
  FREE: "게시글",
};

export function getMeetingPostSaveErrorMessage(
  postType: EditableMeetingPostType,
  isEditing: boolean,
) {
  const target = saveTargetByType[postType];
  return `${target}${target === "게시글" ? "을" : "를"} ${
    isEditing ? "수정" : "등록"
  }하지 못했어요. 다시 시도해 주세요.`;
}

export function getMeetingPostDeleteSuccessMessage(type: MeetingPost["type"]) {
  if (type === "NOTICE") return "공지를 삭제했어요";
  if (type === "RECRUIT") return "봉사 공고를 삭제했어요";
  return "게시글을 삭제했어요";
}

export function getMeetingPostDeleteErrorMessage(type: MeetingPost["type"]) {
  if (type === "NOTICE") {
    return "공지를 삭제하지 못했어요. 다시 시도해 주세요.";
  }
  if (type === "RECRUIT") {
    return "봉사 공고를 삭제하지 못했어요. 다시 시도해 주세요.";
  }
  return "게시글을 삭제하지 못했어요. 다시 시도해 주세요.";
}
