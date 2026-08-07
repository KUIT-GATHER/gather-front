import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";

const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type PostImage = {
  id: string;
  file: File;
  previewUrl: string;
};

interface PostImageUploaderProps {
  images: PostImage[];
  onImagesChange: (images: PostImage[]) => void;
}

export function PostImageUploader({
  images,
  onImagesChange,
}: PostImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageSliderRef = useRef<HTMLDivElement>(null);
  const imageObjectUrlsRef = useRef(new Set<string>());

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const currentPreviewUrls = new Set(images.map((image) => image.previewUrl));

    imageObjectUrlsRef.current.forEach((previewUrl) => {
      if (!currentPreviewUrls.has(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
        imageObjectUrlsRef.current.delete(previewUrl);
      }
    });
  }, [images]);

  useEffect(
    () => () => {
      imageObjectUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });

      imageObjectUrlsRef.current.clear();
    },
    [],
  );

  const handleImageChange = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files);
    const remainingCount = Math.max(0, MAX_IMAGE_COUNT - images.length);
    const filesWithinLimit = selectedFiles.slice(0, remainingCount);

    const acceptedFiles: File[] = [];
    let nextError: string | null = null;

    for (const file of filesWithinLimit) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        nextError = "JPEG, PNG, WebP 형식의 사진만 첨부할 수 있어요.";
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        nextError = "사진 한 장의 크기는 5MB 이하여야 해요.";
        continue;
      }

      acceptedFiles.push(file);
    }

    if (selectedFiles.length > remainingCount) {
      nextError = `사진은 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있어요.`;
    }

    const nextImages = acceptedFiles.map((file): PostImage => {
      const previewUrl = URL.createObjectURL(file);

      imageObjectUrlsRef.current.add(previewUrl);

      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
      };
    });

    if (nextImages.length > 0) {
      onImagesChange([...images, ...nextImages]);
    }

    setImageError(nextError);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const targetImage = images[index];

    if (targetImage) {
      URL.revokeObjectURL(targetImage.previewUrl);
      imageObjectUrlsRef.current.delete(targetImage.previewUrl);
    }

    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);

    onImagesChange(nextImages);

    setActiveImageIndex((current) =>
      Math.max(0, Math.min(current, nextImages.length - 1)),
    );

    setImageError(null);
  };

  const handleImageSliderScroll = () => {
    const slider = imageSliderRef.current;
    const firstImage = slider?.children[0] as HTMLElement | undefined;

    if (!slider || !firstImage) {
      return;
    }

    const closestImageIndex = Array.from(slider.children).reduce(
      (closestIndex, child, index) => {
        const imagePosition =
          (child as HTMLElement).offsetLeft - firstImage.offsetLeft;

        const closestImagePosition =
          (slider.children[closestIndex] as HTMLElement).offsetLeft -
          firstImage.offsetLeft;

        return Math.abs(imagePosition - slider.scrollLeft) <
          Math.abs(closestImagePosition - slider.scrollLeft)
          ? index
          : closestIndex;
      },
      0,
    );

    setActiveImageIndex(closestImageIndex);
  };

  const scrollToImage = (index: number) => {
    const slider = imageSliderRef.current;
    const firstImage = slider?.children[0] as HTMLElement | undefined;
    const image = slider?.children[index] as HTMLElement | undefined;

    if (!slider || !firstImage || !image) {
      return;
    }

    setActiveImageIndex(index);

    slider.scrollTo({
      left: image.offsetLeft - firstImage.offsetLeft,
      behavior: "smooth",
    });
  };

  return (
    <section aria-labelledby="post-image-label">
      <button
        type="button"
        disabled={images.length >= MAX_IMAGE_COUNT}
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl border border-[#90D79D] bg-[#F8FBF8] px-4",
          "text-left text-[14px] font-semibold text-[#18BD77]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-button/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        <ImagePlus aria-hidden="true" className="size-5" />

        <span id="post-image-label">
          사진 첨부 (선택, 최대 {MAX_IMAGE_COUNT}장)
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleImageChange(event.target.files);
        }}
      />

      {imageError ? (
        <p role="alert" className="mt-2 text-[12px] text-point-red">
          {imageError}
        </p>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-4">
          <div
            ref={imageSliderRef}
            aria-label="첨부 사진 미리보기"
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={handleImageSliderScroll}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative min-w-full snap-start overflow-hidden rounded-xl"
              >
                <img
                  src={image.previewUrl}
                  alt={`첨부 사진 ${index + 1}`}
                  className="h-[165px] w-full object-cover"
                />

                <button
                  type="button"
                  aria-label={`${index + 1}번째 사진 삭제`}
                  className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-white/80 text-text-gray-400 backdrop-blur-sm"
                  onClick={() => {
                    removeImage(index);
                  }}
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
            ))}
          </div>

          <div
            className="mt-2 flex justify-center gap-1.5"
            aria-label={`${images.length}장 중 ${
              activeImageIndex + 1
            }번째 사진`}
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`${index + 1}번째 사진 보기`}
                className={cn(
                  "size-1.5 rounded-full",
                  index === activeImageIndex ? "bg-button" : "bg-stroke",
                )}
                onClick={() => {
                  scrollToImage(index);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
