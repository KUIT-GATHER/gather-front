import "@tanstack/react-query";

export type GlobalErrorMode = "silent" | "log";

export interface AppMutationToastMeta {
  success?: string;
  error?: string;
  id?: string;
}

export interface AppQueryMeta extends Record<string, unknown> {
  /**
   * 전역 QueryCache / MutationCache 오류 처리 방식
   *
   * silent:
   * - 전역에서 별도의 오류 처리를 하지 않음
   *
   *
   * log:
   * - 공통 로깅 함수로 오류를 전달
   * - 기본값
   */
  errorMode?: GlobalErrorMode;
}

export interface AppMutationMeta extends AppQueryMeta {
  /** 설정한 결과에만 전역 Toast를 표시한다. */
  toast?: AppMutationToastMeta;
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: unknown;
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}

export {};
