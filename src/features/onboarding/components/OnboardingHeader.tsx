type OnboardingHeaderProps = {
  onSkip: () => void;
};

export function OnboardingHeader({ onSkip }: OnboardingHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-[calc(env(safe-area-inset-top)+40px)] items-end justify-end px-6 pb-2">
      <button
        type="button"
        className="rounded-md px-6 py-1 text-[15px] font-medium leading-5.25 tracking-[-0.15px] text-text-gray-400 transition-colors hover:text-text"
        onClick={onSkip}
      >
        건너뛰기
      </button>
    </header>
  );
}
