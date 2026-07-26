import { useEffect, useRef, useState } from "react";

import type { MeetingMember } from "@/features/team/types/team.types";
import { cn } from "@/shared/lib/cn";

type SharedMeetingMembersCardProps = {
  members: MeetingMember[];
};

const DEFAULT_VISIBLE_SLOT_COUNT = 5;
const AVATAR_SIZE_PX = 44;
const AVATAR_GAP_PX = 12;

const MEMBER_AVATAR_COLOR_CLASSES = [
  "bg-[#78D997]",
  "bg-point-red",
  "bg-[#7FC1FA]",
  "bg-[#F8D27D]",
  "bg-[#DC95D7]",
] as const;

function getInitial(name: string) {
  return name.trim().slice(0, 1) || "?";
}

function getAvatarColorClass(index: number) {
  return MEMBER_AVATAR_COLOR_CLASSES[
    index % MEMBER_AVATAR_COLOR_CLASSES.length
  ];
}

function getVisibleSlotCount(containerWidth: number) {
  const slotCount = Math.floor(
    (containerWidth + AVATAR_GAP_PX) / (AVATAR_SIZE_PX + AVATAR_GAP_PX),
  );

  return Math.max(2, slotCount);
}

export function SharedMeetingMembersCard({
  members,
}: SharedMeetingMembersCardProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [visibleSlotCount, setVisibleSlotCount] = useState(
    DEFAULT_VISIBLE_SLOT_COUNT,
  );
  const visibleMemberCount =
    members.length > visibleSlotCount ? visibleSlotCount - 1 : visibleSlotCount;
  const visibleMembers = members.slice(0, visibleMemberCount);
  const hiddenMemberCount = members.length - visibleMembers.length;

  useEffect(() => {
    const listElement = listRef.current;

    if (!listElement) {
      return;
    }

    const updateVisibleSlotCount = () => {
      setVisibleSlotCount(getVisibleSlotCount(listElement.clientWidth));
    };

    updateVisibleSlotCount();

    const resizeObserver = new ResizeObserver(updateVisibleSlotCount);
    resizeObserver.observe(listElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className="rounded-xl border border-stroke bg-white p-3">
      <h2 className="flex items-baseline gap-1">
        <span className="text-title-18 text-text">팀원</span>
        <span className="text-body-14-semibold text-text-gray-400">
          ({members.length}명)
        </span>
      </h2>

      <ul ref={listRef} className="mt-3 flex items-center gap-3">
        {visibleMembers.map((member, index) => (
          <li key={member.userId} className="shrink-0">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-[23px] text-[14px] leading-[28px] font-semibold text-text2",
                getAvatarColorClass(index),
              )}
            >
              {getInitial(member.nickname)}
            </span>
          </li>
        ))}
        {hiddenMemberCount > 0 ? (
          <li className="shrink-0">
            <span className="flex size-11 items-center justify-center rounded-[23px] bg-stroke text-[14px] leading-[28px] font-semibold text-text2">
              +{hiddenMemberCount}
            </span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
