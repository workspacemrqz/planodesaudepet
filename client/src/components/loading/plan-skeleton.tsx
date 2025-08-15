import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PlanSkeleton() {
  return (
    <Card className="relative">
      <CardHeader className="text-center">
        <Skeleton className="h-6 w-24 mx-auto mb-2" />
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function PlansGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <PlanSkeleton key={i} />
      ))}
    </div>
  );
}