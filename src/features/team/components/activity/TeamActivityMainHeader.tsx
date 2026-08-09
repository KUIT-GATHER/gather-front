type TeamActivityMainHeaderProps = {
  title: string;
};

export function TeamActivityMainHeader({ title }: TeamActivityMainHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-bg pt-[env(safe-area-inset-top)]">
      <div className="flex h-17.5 items-center px-5.5">
        <h1 className="min-w-0 truncate text-[20px] leading-5 font-semibold text-text">
          {title}
        </h1>
      </div>
    </header>
  );
}
