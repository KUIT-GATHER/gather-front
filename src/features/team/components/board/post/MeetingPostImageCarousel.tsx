import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import { cn } from "@/shared/lib/cn";
import { useImageCarousel } from "@/features/team/hooks/useImageCarousel";

type MeetingPostImageCarouselProps = {
  imageUrls?: readonly string[];
  title: string;
  className?: string;
};

export function MeetingPostImageCarousel({
  imageUrls,
  title,
  className,
}: MeetingPostImageCarouselProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pointerStartXRef = useRef<number | null>(null);
  const suppressPreviewRef = useRef(false);
  const {
    images,
    activeIndex,
    dragOffset,
    isDragging,
    hasMultipleImages,
    moveImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useImageCarousel(imageUrls);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-5", className)} aria-label="게시글 이미지">
      <button
        type="button"
        aria-label={`${title} ${activeIndex + 1}번째 이미지 크게 보기`}
        className="w-full overflow-hidden rounded-xl border border-stroke bg-stroke touch-pan-y"
        onClick={() => {
          if (suppressPreviewRef.current) {
            suppressPreviewRef.current = false;
            return;
          }
          setIsPreviewOpen(true);
        }}
        onPointerDown={(event) => {
          pointerStartXRef.current = event.clientX;
          onPointerDown(event);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => {
          suppressPreviewRef.current =
            pointerStartXRef.current !== null &&
            Math.abs(event.clientX - pointerStartXRef.current) >= 8;
          pointerStartXRef.current = null;
          onPointerUp(event);
        }}
        onPointerCancel={(event) => {
          pointerStartXRef.current = null;
          suppressPreviewRef.current = true;
          onPointerCancel(event);
        }}
      >
        <div
          className={cn(
            "flex",
            !isDragging && "transition-transform duration-300 ease-out",
          )}
          style={{
            transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
          }}
        >
          {images.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${title} 이미지 ${index + 1}`}
              draggable={false}
              className="aspect-[358/163] w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </button>

      {hasMultipleImages ? (
        <div
          className="mt-2 flex items-center justify-center gap-2"
          aria-label="게시글 이미지 페이지"
        >
          {images.map((imageUrl, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={`${imageUrl}-indicator-${index}`}
                type="button"
                aria-label={`${index + 1}번째 이미지 보기`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "size-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
                  isActive ? "bg-button" : "bg-stroke",
                )}
                onClick={() => moveImage(index)}
              />
            );
          })}
        </div>
      ) : null}
      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-5 outline-none">
            <Dialog.Title className="sr-only">
              {title} 이미지 크게 보기
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              선택한 게시글 이미지를 크게 표시합니다.
            </Dialog.Description>
            <img
              src={images[activeIndex]}
              alt={`${title} 이미지 ${activeIndex + 1} 크게 보기`}
              className="max-h-full max-w-full object-contain"
            />
            <Dialog.Close
              type="button"
              aria-label="이미지 크게 보기 닫기"
              className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-5 flex size-11 items-center justify-center rounded-full bg-black/40 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-7" aria-hidden="true" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
