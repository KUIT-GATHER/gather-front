type TeamActivitySectionScreenProps = {
  title: string;
  emptyMessage: string;
};

export function TeamActivitySectionScreen({
  title,
  emptyMessage,
}: TeamActivitySectionScreenProps) {
  return (
    <section className="px-5.5 py-5">
      <h2 className="text-[20px] leading-7 font-semibold text-text">{title}</h2>

      <div className="mt-5 flex min-h-62 items-center justify-center rounded-lg border border-dashed border-stroke bg-white px-5 text-center">
        <p className="text-[16px] leading-6 font-medium text-text-gray-400">
          {emptyMessage}
        </p>
      </div>
    </section>
  );
}
