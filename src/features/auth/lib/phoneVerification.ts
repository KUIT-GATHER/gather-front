export function shouldLaunchSmsVerificationApp(
  usesSmsVerification: boolean,
  isMswDevelopment: boolean,
) {
  return usesSmsVerification && !isMswDevelopment;
}
