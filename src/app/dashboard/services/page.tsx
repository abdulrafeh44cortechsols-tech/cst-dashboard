"use client";

import Link from "next/link";
import { Delete, Edit, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useServices } from "@/hooks/useServices";
import { DeleteServiceModal } from "@/components/services/DeleteServiceModal";
import { useState } from "react";
import { Service } from "@/types/types";
import { getImageUrl } from "@/lib/utils";

export default function ServicesPage() {
  const router = useRouter();
  // Use pagination - page 1, page_size 100 to get all services (adjust as needed)
  const { getServicesList } = useServices(1, 10);
  const { data: services, isLoading, isError } = getServicesList;
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log(services,"all data")
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Services</h1>
        <Button variant="blue" asChild size="sm">
          <Link href="/dashboard/services/new">
            <PlusCircle className=" h-4 w-4" />
            Add New Service
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">
          Loading services...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 justify-items-center items-stretch">
            {services && services.length > 0 ? (
              services.map((service) => {
                // DEBUG LOGS
                console.log('=== SERVICE CARD DEBUG ===');
                console.log('Service ID:', service.id);
                console.log('Service Name:', service.name);
                console.log('Hero Image Object:', service.hero_image);
                console.log('Hero Image URL:', service.hero_image?.image);
                console.log('Hero Image Alt:', service.hero_image?.alt_text);
                console.log('Images Array:', service.images);
                console.log('Alt Texts Array:', service.image_alt_texts);
                console.log('Created By (Author):', service.created_by);
                console.log('Author Name (Legacy):', service.author_name);
                console.log('Author Email:', service.author_email);
                console.log('Created At:', service.created_at);
                console.log('========================');
                
                return (
                <Card key={service.id} className="w-full max-w-sm flex flex-col h-full">
                  <div className="relative overflow-hidden group aspect-[400/360] flex-shrink-0">
                    <img
                      src={service.hero_image?.image || service.images?.[0] || "/placeholder.svg"}
                      alt={service.hero_image?.alt_text || service.image_alt_texts?.[0] || service.name || service.title || "Service"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('❌ IMAGE LOAD ERROR for service:', service.id);
                        console.error('Failed URL:', e.currentTarget.src);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                      onLoad={() => {
                        console.log('✅ IMAGE LOADED for service:', service.id, service.hero_image?.image);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="flex flex-col-reverse items-start gap-2 w-full">
                        <span className="line-clamp-2 w-full break-words text-lg">
                          {(service.name || service.title || "").length > 30
                            ? `${(service.name || service.title || "").slice(0, 30)}...`
                            : (service.name || service.title || "")}
                        </span>
                        <Badge variant={service.is_published ? "default" : "outline"} className="mb-2">
                          {service.is_published ? "Published" : "Draft"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 min-h-[60px]">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <div className="mt-auto pt-4">
                      <div className="mb-4 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(service.created_at).toLocaleDateString()}
                        </p>
                        {service.created_by && (
                          <p className="text-sm text-muted-foreground">
                            Author: <span className="font-medium">{service.created_by}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/services/${service.slug}/edit`);
                          }}
                          className="text-gray-600 hover:text-gray-600 h-9 w-20 flex items-center justify-center"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingService(service);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-500 h-9 w-20 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No services found.
              </div>
            )}
          </div>

          {deletingService && (
            <DeleteServiceModal
              service={deletingService}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
