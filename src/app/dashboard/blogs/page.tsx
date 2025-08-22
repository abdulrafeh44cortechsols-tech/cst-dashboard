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
import { BlogPost } from "@/types/blog";
import { DeleteBlogModal } from "@/components/blog/DeleteBlogModal";
import { EditBlogModal } from "@/components/blog/EditBlogModal";

export default function BlogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const postsPerPage = 6;
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
          <PaginationLink href="#" onClick={() => handlePageChange(1)}>
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
            onClick={() => handlePageChange(i)}
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
          <PaginationLink href="#" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">All Blogs</h1>
        <Button asChild size="sm" variant="blue">
          <Link href="/dashboard/blogs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Blog Post
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {blogPosts.length > 0 ? (
              blogPosts.map((post: BlogPost) => (
                <Card key={post.id}>
                  <div className="relative overflow-hidden group">
                    <Image
                      src={post.images?.[0] ||"/placeholer.svg"} // fallback if no image
                      alt={post.title}
                      width={400}
                      height={240}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {post.title}
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {post.summary ?? "No description available."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Published on:{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBlog(post);
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
                        setDeletingBlog(post);
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
                    onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
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

      {editingBlog && (
        <EditBlogModal
          blog={editingBlog}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
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
