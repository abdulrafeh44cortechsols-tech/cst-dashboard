import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const posts = [
  {
    id: "1",
    title: "Getting Started",
    author: "John Doe",
    status: "Published",
    date: "2025-08-01",
  },
  {
    id: "2",
    title: "Understanding goals",
    author: "Jane Smith",
    status: "Draft",
    date: "2025-07-28",
  },
  {
    id: "3",
    title: "Our Happy Clients",
    author: "Alice Johnson",
    status: "Published",
    date: "2025-07-20",
  },
  {
    id: "4",
    title: "Building a strong team",
    author: "Bob Williams",
    status: "Pending Review",
    date: "2025-07-15",
  },
  {
    id: "5",
    title: "Data Management Strategies",
    author: "Charlie Brown",
    status: "Published",
    date: "2025-07-10",
  },
]

export default function PostsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Posts</h1>
        <Button variant="blue" asChild size="sm">
          <Link href="/dashboard/posts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Post
          </Link>
        </Button>
      </div>
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="hidden md:table-cell">{post.author}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={post.status === "Published" ? "default" : "outline"}>{post.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{post.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
