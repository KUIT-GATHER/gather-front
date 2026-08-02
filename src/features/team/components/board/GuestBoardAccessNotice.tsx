import AlertIcon from "@/assets/icons/Alert.svg";

export function GuestBoardAccessNotice() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-button bg-[#F0F6F0] px-4 py-3 text-[14px] leading-5.5 font-semibold text-text">
      <img
        src={AlertIcon}
        alt=""
        className="w-[18.333px] h-[15.833px] shrink-0"
      />
      <p>모임 가입 전에는 공지와 활동 후기만 확인 가능해요.</p>
    </div>
  );
}
