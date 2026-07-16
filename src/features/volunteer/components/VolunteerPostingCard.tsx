import { volunteerPostingCategoryStyle } from "../constants/volunteerPostingList.constants";
import type { VolunteerPostingCardItem } from "../types/volunteerPostingList.types";

type VolunteerPostingCardProps = {
  posting: VolunteerPostingCardItem;
  onClick: () => void;
};

export function VolunteerPostingCard({
  posting,
  onClick,
}: VolunteerPostingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-4 rounded-xl border border-gray-200 p-3 text-left"
    >
      <img
        src={posting.imageUrl}
        alt={posting.title}
        className="h-[104px] w-[88px] shrink-0 rounded-lg object-cover"
      />

      <div className="min-w-0 flex-1 py-0.5">
        <h2 className="truncate text-base font-bold">{posting.title}</h2>
        <p className="mt-1 truncate text-sm text-gray-500">
          {posting.description}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {posting.location} · {posting.date}
          {posting.deadline ? (
            <span className="font-medium text-red-500">
              {" "}
              · {posting.deadline}
            </span>
          ) : null}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {posting.categories.map((category) => (
            <span
              key={category}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${volunteerPostingCategoryStyle[category]}`}
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
