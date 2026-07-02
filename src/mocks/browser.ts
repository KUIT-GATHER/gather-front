//브라우저에서 MSW worker를 시작하는 파일
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
