type OnboardingMessageProps = {
  title: string;
  description: string;
};

export function OnboardingMessage({
  title,
  description,
}: OnboardingMessageProps) {
  return (
    <div className="text-center">
      <h1 className="whitespace-pre-line text-title-24 text-text">{title}</h1>
      <p className="mt-6 whitespace-pre-line text-[18px] font-normal leading-[24px] tracking-[-0.36px] text-text-gray-300">
        {description}
      </p>
    </div>
  );
}
