import { cn } from "@/shared/lib/cn";

import { getCategoryPuzzleAssets } from "../constants/categoryPuzzleAssets";

type CategoryPuzzleProps = {
  code: string;
  selected: boolean;
  className?: string;
};

export function CategoryPuzzle({
  code,
  selected,
  className,
}: CategoryPuzzleProps) {
  const { defaultSrc, selectedSrc } = getCategoryPuzzleAssets(code);

  return (
    <span
      className={cn("relative block size-[105px] shrink-0", className)}
      aria-hidden="true"
    >
      <img
        src={defaultSrc}
        alt=""
        className={cn(
          "absolute inset-0 m-auto block max-h-full max-w-full",
          "transition-opacity duration-150",
          selected ? "opacity-0" : "opacity-100",
        )}
      />

      <img
        src={selectedSrc}
        alt=""
        className={cn(
          "absolute inset-0 m-auto block max-h-full max-w-full",
          "transition-opacity duration-150",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}
