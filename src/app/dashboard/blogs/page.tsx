"use client";

import Link from "next/link";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import Image from "next/image";
import { useState } from "react";
import { BlogPost } from "@/types/types";
import { DeleteBlogModal } from "@/components/blog/DeleteBlogModal";
import { getImageUrl } from "@/lib/utils";

export default function BlogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const postsPerPage = 8;
  const { getBlogsList } = useBlogs(currentPage, postsPerPage);

  const { data, isLoading } = getBlogsList;
  const blogPosts = data?.posts || [];
  const totalPages = data?.totalPages || 1;

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState<BlogPost | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/blogs?${params.toString()}`);
  };
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => { e.preventDefault(); handlePageChange(i); }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  function parseImageUrl(fullUrl: string | undefined) {
    if (!fullUrl || typeof fullUrl !== "string") return "/placeholer.svg";

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const parsedUrl = fullUrl.replace(/^http:\/\/localhost:7000/, baseUrl);
    return parsedUrl;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">All Blogs</h1>
        <Button asChild size="sm" variant="blue">
          <Link href="/dashboard/blogs/new">
            <PlusCircle className=" h-4 w-4" />
            Add New Blog
          </Link>
        </Button>
      </div>

      {/* Blog list */}
      {isLoading ? (
        <div className="text-center text-muted-foreground">
          Loading blog posts...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 justify-items-center items-stretch">
            {blogPosts.length > 0 ? (
              blogPosts.map((post: BlogPost) => (
                <Card key={post.id} className="w-full max-w-sm flex flex-col h-full">
                  <div className="relative overflow-hidden group aspect-[400/360] flex-shrink-0">
                    <Image
                      src={parseImageUrl(post.featured_image?.image) || "/placeholer.svg"}
                      alt={post.featured_image?.alt_text || post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="flex flex-col-reverse items-start gap-2 w-full">
                        <span className="line-clamp-2 w-full break-words text-lg">
                          {post.title.length > 30
                            ? `${post.title.slice(0, 30)}...`
                            : post.title}
                        </span>
                        <Badge variant={post.is_published ? "default" : "outline"} className="mb-2">
                          {post.is_published ? "Published" : "Draft"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 min-h-[60px]">
                        {post.excerpt ? post.excerpt.slice(0, 100) + (post.excerpt.length > 100 ? "..." : "") : "No description available."}
                      </CardDescription>
                    </CardHeader>

                    <div className="mt-auto pt-4">
                      <div className="mb-4 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Published: {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        {post.created_by && (
                          <p className="text-sm text-muted-foreground">
                            Author: <span className="font-medium">{post.created_by}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/blogs/${post.slug}/edit`);
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
                            setDeletingBlog(post);
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
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No blog posts found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

 

      {deletingBlog && (
        <DeleteBlogModal
          blog={deletingBlog}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
