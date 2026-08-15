import { ApiError } from "@/shared/api/apiError";
import { API_ERROR_CODE } from "@/shared/constants/apiErrorCode";

import {
  MAX_RECOGNIZED_MINUTES,
  RECOGNIZED_MINUTES_UNIT,
} from "./recognizedMinutes";

const DEFAULT_APPLY_ERROR_MESSAGE =
  "신청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_CANCEL_ERROR_MESSAGE =
  "신청 취소 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_COMPLETE_ERROR_MESSAGE =
  "완료 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
const DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE =
  "인정시간 저장 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

export const RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE = `인정시간은 ${RECOGNIZED_MINUTES_UNIT}분 단위로 ${MAX_RECOGNIZED_MINUTES / 60}시간 이하까지 입력할 수 있어요.`;

export function getVolunteerPostingApplyErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_APPLY_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.VALIDATION_ERROR:
      return "선택한 봉사 일정을 다시 확인해 주세요.";
    case API_ERROR_CODE.PARTICIPATION_DUPLICATE:
      return "이미 신청한 봉사예요. 하단에서 취소할 수 있어요.";
    case API_ERROR_CODE.POSTING_CLOSED:
      return "마감된 봉사 공고라 신청할 수 없어요.";
    case API_ERROR_CODE.POSTING_APPLICATION_UNAVAILABLE:
      return "외부 신청 정보가 연동되지 않아 신청할 수 없어요.";
    case API_ERROR_CODE.POSTING_NOT_FOUND:
      return "봉사 공고를 찾을 수 없어요.";
    default:
      return DEFAULT_APPLY_ERROR_MESSAGE;
  }
}

export function getVolunteerPostingCancelErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_CANCEL_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "이미 취소되었거나 신청 내역이 없어요.";
    case API_ERROR_CODE.PARTICIPATION_CANCEL_NOT_ALLOWED:
      return "완료한 봉사는 취소할 수 없어요.";
    default:
      return DEFAULT_CANCEL_ERROR_MESSAGE;
  }
}

export function getVolunteerPostingCompleteErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_COMPLETE_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "신청 내역을 찾을 수 없어요.";
    case API_ERROR_CODE.PARTICIPATION_ALREADY_COMPLETED:
      return "이미 완료 처리된 봉사예요.";
    case API_ERROR_CODE.PARTICIPATION_COMPLETE_NOT_ALLOWED:
      return "활동 종료일이 지나야 완료할 수 있어요.";
    case API_ERROR_CODE.POSTING_NOT_FOUND:
      return "봉사 공고를 찾을 수 없어요.";
    default:
      return DEFAULT_COMPLETE_ERROR_MESSAGE;
  }
}

export function getVolunteerPostingRecognizedMinutesErrorMessage(
  error: unknown,
) {
  if (!(error instanceof ApiError)) {
    return DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE;
  }

  switch (error.code) {
    case API_ERROR_CODE.VALIDATION_ERROR:
      return RECOGNIZED_MINUTES_VALIDATION_ERROR_MESSAGE;
    case API_ERROR_CODE.PARTICIPATION_NOT_FOUND:
      return "신청 내역을 찾을 수 없어요.";
    case API_ERROR_CODE.PARTICIPATION_HOURS_NOT_ALLOWED:
      return "완료 처리된 봉사만 인정시간을 입력할 수 있어요.";
    case API_ERROR_CODE.PARTICIPATION_HOURS_ALREADY_SUBMITTED:
      return "이미 인정시간을 입력했어요.";
    default:
      return DEFAULT_RECOGNIZED_MINUTES_ERROR_MESSAGE;
  }
}
