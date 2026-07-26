import { SharedHomeContent } from "@/features/team/components/detail/shared/SharedHomeContent";
import { useTeamDetailContext } from "@/features/team/hooks/useTeamDetailContext";

export function TeamDetailHomePage() {
  const { home, detail } = useTeamDetailContext();

  return <SharedHomeContent home={home} detail={detail} />;
}
