import { teamCategoryStyle } from "../constants/teamList.constants";
import type { TeamCardItem } from "../types/teamList.types";

type TeamCardProps = {
  team: TeamCardItem;
  onClick: () => void;
};

export function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-xl border border-gray-200 p-3 text-left"
    >
      <img
        src={team.imageUrl}
        alt={team.title}
        className="h-[100px] w-[76px] shrink-0 rounded-lg object-cover"
        draggable={false}
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold">{team.title}</h2>
        <p className="mt-1 truncate text-sm text-gray-500">
          {team.description}
        </p>
        <p className="mt-1 truncate text-xs text-gray-500">
          {team.location} · {team.currentMembers}/{team.maxMembers}명 ·{" "}
          {team.date}
          {team.deadline ? (
            <span className="font-medium text-red-500"> · {team.deadline}</span>
          ) : null}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {team.categories.map((category) => (
            <span
              key={category}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${teamCategoryStyle[category]}`}
            >
              <span aria-hidden="true">✦</span>
              {category}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
