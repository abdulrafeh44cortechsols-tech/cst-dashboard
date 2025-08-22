"use server";

import { revalidatePath } from "next/cache";
import { type BlogPost } from "@/types/blog";

// ✅ Simulate database fetching for demo
const generateDummyBlogPosts = (count: number): BlogPost[] => {
  const posts: BlogPost[] = [];

  for (let i = 1; i <= count; i++) {
    posts.push({
      id: i,
      title: `Blog Post Title ${i}`,
      slug: `blog-post-${i}`,
      images: [`/demo/image-${i}.png`], // now an array
      image_files: null, // will be filled if uploading
      published: i % 2 === 0,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      tags: [
        { id: 1, name: "New Technology" },
        { id: 2, name: "Artificial Intelligence" },
      ],
      summary: `This is a short summary for blog post number ${i}.`,
      author_email: "admin@gmail.com",
      tag_ids: [1, 2],
      meta_title: `SEO Meta Title for Blog ${i}`,
      meta_description: `SEO Meta Description for Blog ${i}`,
      og_image_file: null,
      content: `# Blog Content ${i}\n\nThis is the full markdown/content for blog post ${i}.`,
    });
  }
  return posts;
};

const dummyBlogPosts: BlogPost[] = generateDummyBlogPosts(20);

export async function createBlogPost(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const published = formData.get("published") === "true";
  const slug = formData.get("slug") as string;

  if (!title || !slug) {
    return { success: false, message: "Title and slug are required." };
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const newPost: BlogPost = {
    id: dummyBlogPosts.length + 1,
    title,
    slug,
    images: [],
    image_files: null,
    published,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [],
    summary: summary || "",
    author_email: "admin@gmail.com",
    tag_ids: [],
    meta_title: `${title} | My Blog`,
    meta_description: summary || "",
    og_image_file: null,
    content: "",
  };

  dummyBlogPosts.unshift(newPost);

  revalidatePath("/dashboard/blogs");

  return {
    success: true,
    message: `Blog post "${title}" created successfully!`,
  };
}

export async function updateBlogPost(prevState: any, formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const published = formData.get("published") === "true";
  const slug = formData.get("slug") as string;

  if (!id || !title || !slug) {
    return { success: false, message: "ID, title and slug are required." };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const existingPostIndex = dummyBlogPosts.findIndex((post) => post.id === id);

  if (existingPostIndex !== -1) {
    dummyBlogPosts[existingPostIndex] = {
      ...dummyBlogPosts[existingPostIndex],
      title,
      slug,
      summary: summary || "",
      published,
      updated_at: new Date().toISOString(),
    };
  } else {
    return { success: false, message: "Blog post not found." };
  }

  revalidatePath("/dashboard/blogs");

  return {
    success: true,
    message: `Blog post "${title}" updated successfully!`,
  };
}

export async function getPaginatedBlogPosts({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
}) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = dummyBlogPosts.slice(startIndex, endIndex);
  const totalPosts = dummyBlogPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    posts: paginatedPosts,
    totalPosts,
    totalPages,
    currentPage: page,
    limit,
  };
}
