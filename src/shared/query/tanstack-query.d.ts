import "@tanstack/react-query";

export type GlobalErrorMode = "silent" | "log";
// 추후 Toast 로 확장 가능, 혹은 Sentry 같은 모니터링 도구로 확장 가능

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

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: unknown;
    queryMeta: AppQueryMeta;
    mutationMeta: AppQueryMeta;
  }
}

export {};