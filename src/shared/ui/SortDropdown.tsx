import { useEffect, useRef, useState } from "react";

import sortIcon from "@/assets/icons/Sort.svg";

export type SortType = "latest" | "popular" | "deadline" | "default";

const sortOptions: { value: SortType; label: string }[] = [
  { value: "latest", label: "최신순 ✨" },
  { value: "popular", label: "인기순 🔥" },
  { value: "deadline", label: "마감임박 ⏰" },
  { value: "default", label: "공고기반" },
];

interface SortDropdownProps {
  value: SortType;
  onChange: (value: SortType) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (sortType: SortType) => {
    onChange(sortType);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex items-center gap-1 text-sm text-gray-800"
      >
        <img src={sortIcon} alt="" aria-hidden="true" className="size-4" />

        {selectedOption?.label.replace(/[✨🔥⏰]/gu, "").trim()}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {sortOptions.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                  index !== sortOptions.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } ${isSelected ? "font-medium text-red-400" : "text-gray-800"}`}
              >
                <span>{option.label}</span>

                {isSelected && (
                  <span aria-hidden="true" className="text-lg text-red-400">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
