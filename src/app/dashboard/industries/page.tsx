"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, PlusCircle, Trash2, FolderOpen, Star, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIndustries } from "@/hooks/useIndustries";
import { DeleteIndustryModal } from "@/components/industries/DeleteIndustryModal";
import { useState } from "react";
import { Industry } from "@/types/types";
import Image from "next/image";

export default function IndustriesPage() {
  const router = useRouter();
  const { getIndustriesList } = useIndustries();
  const { data: industriesData, isLoading, isError } = getIndustriesList;
  const industries = industriesData?.results || [];
  const [deletingIndustry, setDeletingIndustry] = useState<Industry | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Industries</h1>
        <Button variant="blue" asChild size="sm">
          <Link href="/dashboard/industries/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Industry
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">
          Loading industries...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries && industries.length > 0 ? (
              industries.map((industry: Industry) => (
                <Card
                  key={industry.id}
                  className="overflow-hidden flex pt-0 flex-col min-h-[420px]"
                >
                  <div className="relative overflow-hidden aspect-[400/280]">
                    <Image
                      src={industry.hero_image?.image || "/placeholder.svg"}
                      alt={industry.hero_image?.alt_text || industry.title}
                      fill
                      className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    
                    {/* Category badge overlay */}
                    {industry.industry_category && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700">
                          {industry.industry_category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-medium leading-none">
                            {industry.title}
                          </CardTitle>
                        </div>
                        <Badge
                          variant={industry.is_published ? "default" : "outline"}
                          className="w-fit"
                        >
                          {industry.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-0">
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {industry.description}
                      </CardDescription>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{industry.projects_count} Projects</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          <span>{industry.reviews_count} Reviews</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {industry.tags && industry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {industry.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {industry.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{industry.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`/dashboard/industries/${industry.slug}/edit`);
                        }}
                        className="text-gray-600 hover:text-gray-600"
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-600" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeletingIndustry(industry);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-500"
                      >
                        <Trash2 color="red" className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No industries found.
              </div>
            )}
          </div>

          {deletingIndustry && (
            <DeleteIndustryModal
              industry={deletingIndustry}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
