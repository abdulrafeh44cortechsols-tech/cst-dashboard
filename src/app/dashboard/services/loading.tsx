import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Service cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            {/* Image skeleton */}
            <div className="relative overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0" />
            </div>
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex flex-col items-start gap-2 w-full">
                {/* Title skeleton */}
                <Skeleton className="h-6 w-3/4" />
                
                {/* Status badge skeleton */}
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Description skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 flex justify-end gap-2">
              {/* Edit button skeleton */}
              <Skeleton className="h-8 w-16" />
              
              {/* Delete button skeleton */}
              <Skeleton className="h-8 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 