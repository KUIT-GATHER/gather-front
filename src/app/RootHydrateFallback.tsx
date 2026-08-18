import LoadingState from "@/shared/ui/LoadingState";

export function RootHydrateFallback() {
  return (
    <LoadingState
      className="min-h-dvh bg-bg"
      label="화면을 불러오는 중이에요."
    />
  );
}
