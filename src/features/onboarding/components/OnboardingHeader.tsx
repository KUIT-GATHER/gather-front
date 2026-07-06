type OnboardingHeaderProps = {
  onSkip: () => void;
};

export function OnboardingHeader({ onSkip }: OnboardingHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-start justify-end px-5 pt-[calc(env(safe-area-inset-top)+20px)]">
      <button
        type="button"
        className="rounded-md px-1 py-1 text-sm text-text-gray-300 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        onClick={onSkip}
      >
        건너뛰기
      </button>
    </header>
  );
}
