import type { ApiErrorCode } from "@/shared/constants/apiErrorCode";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiErrorResponse = {
  success: false;
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
