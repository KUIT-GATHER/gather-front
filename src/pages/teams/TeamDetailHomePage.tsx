import { SharedHomeContent } from "@/features/team/components/detail/shared/SharedHomeContent";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";

export function TeamDetailHomePage() {
  const { home, detail, imageUrls } = useTeamDetailContext();

  return (
    <SharedHomeContent home={home} detail={detail} imageUrls={imageUrls} />
  );
}
