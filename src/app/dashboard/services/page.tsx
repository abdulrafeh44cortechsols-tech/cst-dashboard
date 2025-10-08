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
import { EditServiceModal } from "@/components/services/EditServiceModal";
import { DeleteServiceModal } from "@/components/services/DeleteServiceModal";
import { useState } from "react";
import { Service } from "@/types/types";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export default function ServicesPage() {
  const router = useRouter();
  const { getServicesList } = useServices();
  const { data: services, isLoading, isError } = getServicesList;
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log("services", services);

  function parseImageUrl(fullUrl: string | undefined) {
    if (!fullUrl || typeof fullUrl !== "string") return "/placeholer.svg";

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const parsedUrl = fullUrl.replace(/^http:\/\/localhost:7000/, baseUrl);
    console.log("parsedUrl:", parsedUrl);
    return parsedUrl;
  }

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services && services.length > 0 ? (
              services.map((service) => (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between h-full pt-0 overflow-hidden" // Make card a flex column
                >
                  <div>
                    <CardHeader className="flex flex-col pt-4 items-start justify-between space-y-0 pb-2">
                      <div className="flex flex-row items-center gap-2">
                        <div className="relative overflow-hidden ">
                          <Image
                            src={
                              parseImageUrl(service.images?.[0]) ||
                              "/placeholer.svg"
                            }
                            alt="img"
                            height={50}
                            width={50}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <CardTitle className="text-lg font-medium flex flex-col-reverse items-start gap-2 pt-2">
                          {service.title}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={service.is_active ? "default" : "outline"}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{service.description}</CardDescription>
                    </CardContent>
                  </div>
                  <CardFooter className="pt-0 flex justify-end gap-2 mt-auto">
                    {/* mt-auto pushes footer to bottom */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(`/dashboard/services/${service.slug}/edit`);
                      }}
                      className="text-gray-600 hover:text-gray-600"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-600 " />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingService(service);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-500"
                    >
                      <Trash2 color="red" className="w-3.5 h-3.5 " />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No services found.
              </div>
            )}
          </div>

          {editingService && (
            <EditServiceModal
              service={editingService}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
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
