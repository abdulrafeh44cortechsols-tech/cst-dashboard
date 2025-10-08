"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { servicesDataService } from "@/services/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditServiceForm } from "@/components/services/EditServiceForm";
import Link from "next/link";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string | undefined;

  const { data: service, isLoading, isError } = useQuery({
    queryKey: ["service", "slug", slugParam],
    queryFn: async () => {
      if (!slugParam) throw new Error("Missing service slug");
      return servicesDataService.getServiceBySlug(slugParam);
    },
    enabled: !!slugParam,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Edit Service</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild variant="blue">
            <Link href="/dashboard/services">All Services</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="text-muted-foreground">Loading service...</div>
          )}
          {isError && (
            <div className="text-red-500">Failed to load service. Please try again.</div>
          )}
          {!isLoading && service && (
            <EditServiceForm
              service={service}
              onCancel={() => router.push("/dashboard/services")}
              onSaved={() => router.push("/dashboard/services")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
