import teamPlusIcon from "@/assets/volunteer/teamplus.svg";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingTeamSectionProps = {
  className?: string;
  onCreateTeam: () => void;
};

export function VolunteerPostingTeamSection({
  className,
  onCreateTeam,
}: VolunteerPostingTeamSectionProps) {
  return (
    <section className={cn("pt-1", className)}>
      <h2 className="text-[18px] leading-4 font-semibold text-[#000]">
        함께하는 팀
      </h2>

      <p className="mt-4 rounded-xl border border-dashed border-stroke bg-[#F8FBF8] px-4 py-5 text-center text-sm text-text-gray-400">
        이 공고와 연결된 모임을 준비 중이에요.
      </p>

      <button
        type="button"
        onClick={onCreateTeam}
        className={cn(
          "mt-6 flex h-12.5 w-full items-center justify-center gap-3 rounded-xl",
          "border border-dashed border-point-green bg-[#F8FBF8] text-[16px] leading-[19.5px] font-semibold text-text-green-600",
          "transition hover:bg-point-green/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
        )}
      >
        <img src={teamPlusIcon} alt="" className="h-3.5 w-3.5" />
        <span>이 봉사로 팀 만들기</span>
      </button>
    </section>
  );
}
