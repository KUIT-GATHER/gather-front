export const NETWORK_ACTION_ERROR_MESSAGE = "네트워크 연결을 확인해 주세요";

export function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof TypeError
    ? NETWORK_ACTION_ERROR_MESSAGE
    : fallbackMessage;
}
