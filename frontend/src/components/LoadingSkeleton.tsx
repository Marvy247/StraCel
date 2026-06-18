import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="h-full flex flex-col animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Shimmer className="h-6 w-3/4" />
          <Shimmer className="h-6 w-16" />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Shimmer className="h-4 w-24" />
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 mb-4">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
          <Shimmer className="h-4 w-4/6" />
        </div>

        <div className="space-y-2">
          <Shimmer className="h-8 w-32" />
          <Shimmer className="h-4 w-40" />
        </div>
      </CardContent>

      <CardFooter>
        <Shimmer className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
