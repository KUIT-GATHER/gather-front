import { useEffect, useId, useMemo, useState } from "react";

import CameraIcon from "@/assets/icons/Camera.svg";
import defaultProfileImage from "@/assets/icons/Profile.svg";
import {
  getProfileImageValidationError,
  PROFILE_IMAGE_ACCEPT,
} from "@/features/profile/lib/profileImageUpload";
import { cn } from "@/shared/lib/cn";

type ProfileImagePickerProps = {
  file: File | null;
  imageUrl?: string | null;
  onFileChange: (file: File | null) => void;
  className?: string;
  alt?: string;
};

export function ProfileImagePicker({
  file,
  imageUrl,
  onFileChange,
  className,
  alt = "프로필 이미지",
}: ProfileImagePickerProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayedImage = previewUrl || imageUrl || defaultProfileImage;

  return (
    <div>
      <label
        htmlFor={inputId}
        className={cn(
          "relative mx-auto block size-[95px] cursor-pointer rounded-full focus-within:ring-2 focus-within:ring-button/40",
          className,
        )}
      >
        <img
          src={displayedImage}
          alt={alt}
          className="size-full rounded-full object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -bottom-0.5 grid size-8 place-items-center rounded-full bg-white shadow"
        >
          <img src={CameraIcon} alt="" className="size-5" />
        </span>
        <input
          id={inputId}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          aria-label="프로필 이미지 선택"
          aria-describedby={error ? errorId : undefined}
          className="sr-only"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;

            const validationError =
              getProfileImageValidationError(selectedFile);
            setError(validationError);
            onFileChange(validationError ? null : selectedFile);
            event.target.value = "";
          }}
        />
      </label>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-center text-xs text-point-red"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
