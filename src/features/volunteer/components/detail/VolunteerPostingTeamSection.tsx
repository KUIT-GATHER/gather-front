import { cn } from "@/shared/lib/cn";

type VolunteerPostingTeamSectionProps = {
  className?: string;
};

export function VolunteerPostingTeamSection({
  className,
}: VolunteerPostingTeamSectionProps) {
  return (
    <section className={cn("pt-1", className)}>
      <h2 className="text-[18px] leading-4 font-semibold text-[#000]">
        함께하는 팀
      </h2>

      <p className="mt-4 rounded-xl border border-dashed border-stroke bg-[#F8FBF8] px-4 py-5 text-center text-sm text-text-gray-400">
        이 공고와 연결된 모임을 준비 중이에요.
      </p>
    </section>
  );
}
