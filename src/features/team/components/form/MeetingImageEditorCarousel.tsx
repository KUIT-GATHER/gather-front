import { X } from "lucide-react";

import { useImageCarousel } from "@/features/team/hooks/useImageCarousel";
import { cn } from "@/shared/lib/cn";

type MeetingImageCarouselItem = {
  id: string;
  previewUrl: string;
};

type MeetingImageEditorCarouselProps = {
  images: MeetingImageCarouselItem[];
  disabled?: boolean;
  className?: string;
  onRemove: (index: number) => void;
};

export function MeetingImageEditorCarousel({
  images,
  disabled = false,
  className,
  onRemove,
}: MeetingImageEditorCarouselProps) {
  const {
    images: imageUrls,
    activeIndex,
    dragOffset,
    isDragging,
    hasMultipleImages,
    moveImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useImageCarousel(images.map((image) => image.previewUrl));

  if (imageUrls.length === 0) return null;

  return (
    <div className={cn("mt-5", className)}>
      <div
        className="overflow-hidden rounded-2xl bg-stroke touch-pan-y"
        aria-label="첨부 사진 미리보기"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
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
          {imageUrls.map((imageUrl, index) => (
            <div
              key={images[index]?.id ?? `${imageUrl}-${index}`}
              className="relative w-full shrink-0"
            >
              <img
                src={imageUrl}
                alt={`첨부 사진 ${index + 1}`}
                draggable={false}
                className="h-44 w-full object-cover"
              />
              <button
                type="button"
                aria-label={`첨부 사진 ${index + 1} 삭제`}
                disabled={disabled}
                className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/80 text-text-gray-400 shadow-sm backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-button/50 disabled:cursor-not-allowed disabled:opacity-50"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onRemove(index)}
              >
                <X aria-hidden="true" className="size-6" strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {hasMultipleImages ? (
        <div
          className="mt-3 flex h-3 items-center justify-center gap-2"
          aria-label={`${imageUrls.length}장 중 ${activeIndex + 1}번째 사진`}
        >
          {imageUrls.map((imageUrl, index) => (
            <button
              key={`${images[index]?.id ?? imageUrl}-indicator`}
              type="button"
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === activeIndex ? "true" : undefined}
              disabled={disabled}
              className={cn(
                "size-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-button/50",
                index === activeIndex ? "bg-text-green-600" : "bg-stroke",
              )}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => moveImage(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
