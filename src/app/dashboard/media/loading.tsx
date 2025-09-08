import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Media Gallery Header skeleton */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
      </Card>

      {/* Blogs Section skeleton */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" /> {/* Icon skeleton */}
            <Skeleton className="h-6 w-32" /> {/* Title skeleton */}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Blog group skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" /> {/* Blog ID skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video relative bg-slate-100">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-2 left-2">
                        <Skeleton className="h-5 w-16" /> {/* Badge skeleton */}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-32" /> {/* Image label skeleton */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Section skeleton */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" /> {/* Icon skeleton */}
            <Skeleton className="h-6 w-36" /> {/* Title skeleton */}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Service group skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24" /> {/* Service ID skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video relative bg-slate-100">
                      <Skeleton className="w-full h-full" />
                      <div className="absolute top-2 left-2">
                        <Skeleton className="h-5 w-16" /> {/* Badge skeleton */}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-36" /> {/* Image label skeleton */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 