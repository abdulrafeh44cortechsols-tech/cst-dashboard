"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Delete, Edit, Pencil, PlusCircle, Trash2 } from "lucide-react";
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
  const { data: industries, isLoading, isError } = getIndustriesList;
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
              industries.map((industry:any) => (
                <Card
                  key={industry.id}
                  className="overflow-hidden flex pt-0 flex-col min-h-[400px]"
                >
                  <div className="relative overflow-hidden aspect-[400/360]">
                    <Image
                      src={industry.images[0] || "/placeholder.svg"}
                      alt={industry.name}
                      fill
                      className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  <div className="flex flex-col flex-1">
                    <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-col gap-1 flex-1">
                        <CardTitle className="text-lg font-medium leading-none">
                          {industry.name}
                        </CardTitle>
                        <Badge
                          variant={industry.is_active ? "default" : "outline"}
                          className="w-fit"
                        >
                          {industry.is_active ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-0">
                      <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                        {industry.description}
                      </CardDescription>

                      {/* Tags */}
                      {industry.tags && industry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {industry.tags.slice(0, 3).map((tag: any) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.name}
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

          {/* Edit modal commented out - now using dedicated edit page */}
          {/* {editingIndustry && (
            <EditIndustryModal
              industry={editingIndustry}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )} */}
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
