export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10" aria-busy="true" aria-label="Loading">
      <div className="mb-6 h-6 w-40 rounded-full bg-raised" />
      <div className="mb-3 h-10 w-2/3 rounded-xl bg-raised" />
      <div className="mb-10 h-4 w-1/2 rounded-full bg-raised" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-raised" />
        ))}
      </div>
    </div>
  );
}
