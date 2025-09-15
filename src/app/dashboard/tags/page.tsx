"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTags } from "@/hooks/useTags";
import { AddTagModal } from "@/components/tags/AddTagModal";
import { EditTagModal } from "@/components/tags/EditTagModal";
import { DeleteTagModal } from "@/components/tags/DeleteTagModal";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Hash,
  Calendar,
  TrendingUp,
  Filter
} from "lucide-react";
import { AdminOnlyRoute } from "@/components/RouteGuard";
import { toast } from "sonner";
import type { Tag } from "@/types/types";

export default function TagsPage() {
  const { getTags, createTag, deleteTag } = useTags();
  const { data: tagsResponse, isLoading, isError } = getTags;
  const tags = tagsResponse?.data || [];

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "usage">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtered and sorted tags
  const filteredAndSortedTags = useMemo(() => {
    let filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "usage":
          aValue = a.blog_count;
          bValue = b.blog_count;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [tags, searchTerm, sortBy, sortOrder]);

  // Statistics
  const totalTags = tags.length;
  const usedTags = tags.filter(tag => tag.blog_count > 0).length;
  const unusedTags = totalTags - usedTags;
  const totalUsage = tags.reduce((sum, tag) => sum + tag.blog_count, 0);

  // CRUD handlers
  const handleAddTag = async (tagData: { name: string }) => {
    try {
      await createTag.mutateAsync(tagData);
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  };

  const handleEditTag = async (id: number, tagData: { name: string; slug: string }) => {
    // TODO: Implement with actual API call
    console.log("Editing tag:", id, tagData);
    throw new Error("API not implemented yet");
  };

  const handleDeleteTag = async (id: number) => {
    try {
      await deleteTag.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete tag:", error);
      throw error;
    }
  };

  const handleSort = (column: "name" | "usage") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: "name" | "usage") => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (isLoading) {
    return (
      <AdminOnlyRoute>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg md:text-2xl">Tags</h1>
          </div>
          <div className="text-center text-muted-foreground py-8">
            Loading tags...
          </div>
        </div>
      </AdminOnlyRoute>
    );
  }

  if (isError) {
    return (
      <AdminOnlyRoute>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg md:text-2xl">Tags</h1>
          </div>
          <div className="text-center text-red-500 py-8">
            Failed to load tags. Please try again.
          </div>
        </div>
      </AdminOnlyRoute>
    );
  }

  return (
    <AdminOnlyRoute>
      <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-lg md:text-2xl">Tags Management</h1>
          <p className="text-muted-foreground">
            Manage tags used to categorize your content
          </p>
        </div>
        <Button variant="blue" onClick={() => setIsAddModalOpen(true)} size="sm">
          <PlusCircle className=" h-4 w-4" />
          Add Tag
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Tags</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usedTags}</div>
            <p className="text-xs text-muted-foreground">
              {totalTags > 0 ? Math.round((usedTags / totalTags) * 100) : 0}% of all tags
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unused Tags</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unusedTags}</div>
            <p className="text-xs text-muted-foreground">
              Available for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Across all content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tags List</CardTitle>
          <CardDescription>
            Search and manage all your tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedTags.length} of {totalTags} tags
            </div>
          </div>

          {/* Tags Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    Name {getSortIcon("name")}
                  </TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("usage")}
                  >
                    Blogs Usage {getSortIcon("usage")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {searchTerm ? "No tags match your search." : "No tags found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{tag.name}</span>
                          {tag.blog_count === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Unused
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {tag.slug}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={tag.blog_count > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tag.blog_count} post{tag.blog_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTag(tag);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTag(tag);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddTagModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTag}
      />

      <EditTagModal
        tag={selectedTag}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTag(null);
        }}
        onEdit={handleEditTag}
      />

      <DeleteTagModal
        tag={selectedTag}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTag(null);
        }}
        onDelete={handleDeleteTag}
      />
    </div>
    </AdminOnlyRoute>
  );
}