// 기존 브라우저 개발 환경의 MSW handler를 Node 테스트 환경에서도 재사용
import { setupServer } from "msw/node";

import { handlers } from "@/mocks/handlers";

export const server = setupServer(...handlers);
