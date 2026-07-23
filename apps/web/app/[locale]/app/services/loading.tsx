export default function ServicesLoading() {
  return (
    <div className="container p-4 mx-auto max-w-5xl md:p-8 space-y-6 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="w-48 h-8 rounded-md bg-muted" />
          <div className="w-64 h-4 rounded-md bg-muted" />
        </div>
        <div className="w-32 h-10 rounded-md bg-muted" />
      </div>

      <div className="w-full h-10 mb-4 rounded-md bg-muted max-w-[200px]" />
      
      <div className="border rounded-md divide-y bg-card">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-2">
              <div className="w-32 h-5 rounded-md bg-muted" />
              <div className="w-24 h-4 rounded-md bg-muted" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-8 rounded-md bg-muted" />
              <div className="w-20 h-8 rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
