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
      <div
        className="overflow-hidden rounded-xl border border-stroke bg-stroke touch-pan-y"
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
          {images.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${title} 이미지 ${index + 1}`}
              draggable={false}
              className="aspect-[311/207] w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </div>

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
    </div>
  );
}
