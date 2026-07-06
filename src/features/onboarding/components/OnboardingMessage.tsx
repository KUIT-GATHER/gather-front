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
      <h1 className="whitespace-pre-line text-title-18 text-text">{title}</h1>
      <p className="mt-6 whitespace-pre-line text-body-14 text-text-gray-300">
        {description}
      </p>
    </div>
  );
}
