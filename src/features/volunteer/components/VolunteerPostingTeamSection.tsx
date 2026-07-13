import { ChevronRight, Plus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router";

type VolunteerPostingTeamSectionProps = {
  postingId: number;
};

function TeamCard() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-stroke bg-white px-4 py-3 text-left transition hover:bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
    >
      <span className="flex size-13 shrink-0 items-center justify-center rounded-lg bg-button/5 text-body-14-semibold text-button">
        환경
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-15-semibold text-text">
          한강공원 플로깅팀
        </span>
        <span className="mt-1 flex items-center gap-1 text-body-14 text-text-gray-300">
          <UsersRound aria-hidden="true" className="size-4 text-icon" />
          12명 활동중
        </span>
      </span>

      <ChevronRight
        aria-hidden="true"
        className="size-7 shrink-0 text-text-gray-300"
        strokeWidth={3}
      />
    </button>
  );
}

export function VolunteerPostingTeamSection({
  postingId,
}: VolunteerPostingTeamSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="-mx-5.5 border-t-8 border-stroke/35 px-5.5 pt-5">
      <h2 className="text-body-15-semibold text-text">함께하는 팀</h2>

      <div className="mt-4">
        <TeamCard />
      </div>

      <button
        type="button"
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-point-green bg-white text-body-15-semibold text-button transition hover:bg-button/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        onClick={() => navigate(`/volunteers/${postingId}/teams/new`)}
      >
        <Plus aria-hidden="true" className="size-5" />
        이 봉사로 팀 만들기
      </button>
    </section>
  );
}
