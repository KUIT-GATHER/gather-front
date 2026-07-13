import { useNavigate } from "react-router";

import ActivatingPeopleIcon from "@/assets/volunteer/activatingpeople.svg";
import RightArrowIcon from "@/assets/volunteer/rightarrow.svg";
import TeamPlusIcon from "@/assets/volunteer/teamplus.svg";
import { cn } from "@/shared/lib/cn";

type VolunteerPostingTeamSectionProps = {
  postingId: number;
  className?: string;
};

const dashedBorderSvg =
  "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='99%25' height='99%25' x='0.5%25' y='0.5%25' rx='12' ry='12' fill='none' stroke='%2390D79D' stroke-width='1' stroke-dasharray='10 8'/%3E%3C/svg%3E\")";

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
        <span className="block truncate font-['Inter'] text-[16px] leading-[22px] font-medium text-text">
          한강공원 플로깅팀
        </span>
        <span className="mt-1 flex items-center gap-1 font-['Inter'] text-[15px] leading-[22px] font-normal text-text-gray-400">
          <img src={ActivatingPeopleIcon} alt="" className="size-4" />
          12명 활동중
        </span>
      </span>

      <img src={RightArrowIcon} alt="" className="h-5.5 w-3 shrink-0" />
    </button>
  );
}

export function VolunteerPostingTeamSection({
  postingId,
  className,
}: VolunteerPostingTeamSectionProps) {
  const navigate = useNavigate();

  return (
    <section className={cn("pt-1", className)}>
      <h2 className="text-[18px] leading-4 font-semibold text-[#000]">
        함께하는 팀
      </h2>

      <div className="mt-4">
        <TeamCard />
      </div>

      <button
        type="button"
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F8FBF8] text-body-15-semibold text-button transition hover:bg-button/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40"
        style={{
          backgroundImage: dashedBorderSvg,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
        onClick={() => navigate(`/volunteers/${postingId}/teams/new`)}
      >
        <img src={TeamPlusIcon} alt="" className="size-3.5" />
        이 봉사로 팀 만들기
      </button>
    </section>
  );
}
