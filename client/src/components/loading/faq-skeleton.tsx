import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FaqItemSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="flex justify-between items-center p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

export function FaqSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <FaqItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}