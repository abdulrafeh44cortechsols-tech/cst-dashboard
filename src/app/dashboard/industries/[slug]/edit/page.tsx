"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { industriesDataService } from "@/services/industries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { EditIndustryForm } from "@/components/industries/EditIndustryForm";

export default function EditIndustryPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string | undefined;

  const { data: industry, isLoading, isError } = useQuery({
    queryKey: ["industry", "slug", slugParam],
    queryFn: async () => {
      if (!slugParam) throw new Error("Missing industry slug");
      return industriesDataService.getIndustryBySlug(slugParam);
    },
    enabled: !!slugParam,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header with consistent spacing */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Edit Industry</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild variant="blue">
            <Link href="/dashboard/industries">All Industries</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground">Loading industry...</div>
          )}
          {isError && (
            <div className="text-red-500">Failed to load industry. Please try again.</div>
          )}
          {!isLoading && industry && (
            <EditIndustryForm
              industry={industry}
              onCancel={() => router.push("/dashboard/industries")}
              onSaved={() => router.push("/dashboard/industries")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
