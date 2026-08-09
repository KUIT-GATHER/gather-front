import ArrowIcon from "@/assets/icons/Arrow.svg";

type TeamSettingsMenuItemProps = {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
};

export function TeamSettingsMenuItem({
  iconSrc,
  title,
  description,
  onClick,
}: TeamSettingsMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 w-full items-center justify-between rounded-[12px] border border-stroke bg-white px-5 py-4 text-left"
    >
      <div className="flex min-w-0 items-center gap-3">
        <img src={iconSrc} alt="" className={"size-[40px] shrink-0"} />

        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-[18px] leading-none font-medium text-text">
            {title}
          </p>

          <p className="truncate text-[15px] leading-[16.5px] font-medium text-[#A4A4A4]">
            {description}
          </p>
        </div>
      </div>

      <img src={ArrowIcon} alt="" className="size-10 shrink-0" />
    </button>
  );
}
