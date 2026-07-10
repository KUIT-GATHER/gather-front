import PageContainer from "@/shared/ui/PageContainer";

export function RootRouteErrorBoundary() {
  return (
    <main>
      <PageContainer size="narrow">
        <h1>Something went wrong</h1>
        <p>We're sorry, but an unexpected error occurred.</p>
      </PageContainer>
    </main>
  );
}
