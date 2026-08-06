import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/shared/lib/cn";

const ACTION_WIDTH = 80;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const SWIPE_START_THRESHOLD = 8;

type SwipeActionRowProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  children: ReactNode;
};

type SwipeDirection = "horizontal" | "vertical" | null;

export function SwipeActionRow({
  open,
  onOpenChange,
  onDelete,
  deleteDisabled = false,
  children,
}: SwipeActionRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ignoreClickRef = useRef(false);
  const gestureRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startOffset: 0,
    offset: 0,
    direction: null as SwipeDirection,
    swiped: false,
  });
  const [offset, setOffset] = useState(open ? -ACTION_WIDTH : 0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setOffset(open ? -ACTION_WIDTH : 0);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeWhenOutside = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", closeWhenOutside);

    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, [onOpenChange, open]);

  const finishGesture = (
    event: PointerEvent<HTMLDivElement>,
    wasCancelled = false,
  ) => {
    const gesture = gestureRef.current;

    if (gesture.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);

    const shouldOpen = wasCancelled
      ? open
      : gesture.direction === "horizontal"
        ? gesture.offset <= -OPEN_THRESHOLD
        : open;

    setOffset(shouldOpen ? -ACTION_WIDTH : 0);

    if (shouldOpen !== open) {
      onOpenChange(shouldOpen);
    }

    if (gesture.swiped) {
      ignoreClickRef.current = true;
      window.setTimeout(() => {
        ignoreClickRef.current = false;
      }, 0);
    }

    gesture.pointerId = null;
    gesture.direction = null;
  };

  const displayedOffset = isDragging ? offset : open ? -ACTION_WIDTH : 0;
  const isDeleteActionVisible = open || (isDragging && displayedOffset < 0);

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      {isDeleteActionVisible ? (
        <div
          className="absolute inset-y-0 right-0 flex w-20 items-stretch bg-point-red"
          aria-hidden={!open}
        >
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-center text-text2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
              !open && "pointer-events-none",
            )}
            aria-label="알림 삭제"
            aria-hidden={!open}
            tabIndex={open ? 0 : -1}
            disabled={deleteDisabled || !open}
            onClick={onDelete}
          >
            <Trash2 className="size-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 touch-pan-y",
          !isDragging && "transition-transform duration-200 ease-out",
        )}
        style={{ transform: `translateX(${displayedOffset}px)` }}
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }

          gestureRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startOffset: open ? -ACTION_WIDTH : 0,
            offset: open ? -ACTION_WIDTH : 0,
            direction: null,
            swiped: false,
          };
          setOffset(open ? -ACTION_WIDTH : 0);
        }}
        onPointerMove={(event) => {
          const gesture = gestureRef.current;

          if (gesture.pointerId !== event.pointerId) {
            return;
          }

          const deltaX = event.clientX - gesture.startX;
          const deltaY = event.clientY - gesture.startY;

          if (!gesture.direction) {
            if (Math.abs(deltaY) > Math.abs(deltaX) + SWIPE_START_THRESHOLD) {
              gesture.direction = "vertical";
              return;
            }

            if (Math.abs(deltaX) > SWIPE_START_THRESHOLD) {
              gesture.direction = "horizontal";

              if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.setPointerCapture(event.pointerId);
              }

              setIsDragging(true);
            }
          }

          if (gesture.direction !== "horizontal") {
            return;
          }

          const nextOffset = Math.min(
            0,
            Math.max(-ACTION_WIDTH, gesture.startOffset + deltaX),
          );

          gesture.offset = nextOffset;
          gesture.swiped = true;
          setOffset(nextOffset);
        }}
        onPointerUp={finishGesture}
        onPointerCancel={(event) => finishGesture(event, true)}
        onClickCapture={(event) => {
          if (!ignoreClickRef.current) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          ignoreClickRef.current = false;
        }}
      >
        {children}
      </div>
    </div>
  );
}
