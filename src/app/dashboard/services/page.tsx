"use client";

import Link from "next/link";
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
import { useServices } from "@/hooks/useServices";
import { EditServiceModal } from "@/components/services/EditServiceModal";
import { DeleteServiceModal } from "@/components/services/DeleteServiceModal";
import { useState } from "react";
import { Service } from "@/types/types";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export default function ServicesPage() {
  const { getServicesList } = useServices();
  const { data: services, isLoading, isError } = getServicesList;
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading services...
      </div>
    );
  }

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
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services && services.length > 0 ? (
          services.map((service) => (
            <Card
              key={service.id}
              className="flex flex-col justify-between h-full" // Make card a flex column
            >
              <div>
                <div className="relative overflow-hidden">
                  <Image
                    src={
                      parseImageUrl(service.images?.[0]) || "/placeholer.svg"
                    }
                    alt="img"
                    width={400}
                    height={240}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex flex-col-reverse items-start gap-2 pt-2">
                    {service.title}
                    <Badge variant={service.is_active ? "default" : "outline"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
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
                    setEditingService(service);
                    setIsModalOpen(true);
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
    </div>
  );
}
