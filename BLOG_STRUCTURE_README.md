# Blog Structure Documentation

## Overview

The blog system has been updated to support a comprehensive structure that includes additional fields like `sections_data`, `hero_section`, `quote_section`, `info_section`, and other structured content beyond basic blog information.

## New Blog Payload Structure

### Basic Fields
- `title`: Blog title
- `content`: Main blog content
- `published`: Boolean indicating if blog is published
- `tag_ids`: Array of tag IDs
- `image_files`: Array of blog images
- `meta_title`: SEO meta title
- `meta_description`: SEO meta description
- `og_image_file`: Open Graph image file (optional)

### New Fields
- `sections_data`: Object containing structured blog sections
- `hero_section`: Hero section with title, description, summary, and image
- `quote_section`: Quote section with summary and array of quotes
- `info_section`: Information section with title, description, summaries, and image

## Sections Data Structure

### sections_data Object
The `sections_data` object contains structured sections for the blog:

```json
{
  "sections_data": {
    "hero_section": {
      "title": "Building a Modern Web Application",
      "description": "Modern web applications require careful consideration...",
      "summary": "Learn the fundamentals",
      "image": ""
    },
    "quote_section": {
      "summary": "Learn from industry experts",
      "quotes": [
        {
          "title": "On readable code",
          "description": "Clarity beats cleverness",
          "quote": "Code is like humor. When you have to explain it, it's bad.",
          "quoteusername": "Cory House"
        }
      ]
    },
    "info_section": {
      "title": "Development Best Practices",
      "description": "Essential practices for building modern web applications",
      "summary": "Follow these guidelines",
      "summary_2": "Additional insights and advanced techniques",
      "image": ""
    }
  }
}
```

### Section Details

#### Hero Section
- `title`: Hero section title
- `description`: Hero section description
- `summary`: Hero section summary
- `image`: Hero image file upload

#### Quote Section
- `summary`: Quote section summary
- `quotes`: Array of quote objects, each containing:
  - `title`: Quote title
  - `description`: Quote description
  - `quote`: The actual quote text
  - `quoteusername`: Quote author name

#### Info Section
- `title`: Info section title
- `description`: Info section description
- `summary`: Primary summary
- `summary_2`: Secondary/additional summary
- `image`: Info section image file upload

## API Endpoints

### Create Blog
- **POST** `/api/v1/blogs/`
- Accepts both `FormData` and `CreateBlogData` objects
- Returns created blog

### Update Blog
- **PATCH** `/api/v1/blogs/{id}/`
- Accepts both `FormData` and `CreateBlogData` objects
- Returns updated blog

### Get Blogs
- **GET** `/api/v1/blogs/`
- Returns array of blogs

### Delete Blog
- **DELETE** `/api/v1/blogs/{id}/`
- Deletes blog by ID

## Frontend Components

### Blog Creation Form
- Located at `/dashboard/blogs/new`
- Tabbed interface with three main sections:
  - **Basic Info**: Title, content, meta data, tags, publish status
  - **Sections**: Hero, quote, and info section configuration
  - **Media**: Blog images and OG image uploads

### Form Features
- **Dynamic Section Management**: Configure hero, quote, and info sections
- **Quote Management**: Add/remove quotes dynamically
- **File Uploads**: Multiple image uploads with previews
- **Tag Selection**: Interactive tag selection with visual feedback
- **Publish Control**: Toggle for immediate publishing
- **Validation**: Required field validation and content length checks

## TypeScript Types

All types are defined in `src/types/types.ts`:

- `BlogPost`: Complete blog interface
- `CreateBlogData`: Data structure for creating/updating blogs
- `BlogSectionsData`: Complete sections data structure
- `HeroSection`: Hero section interface
- `QuoteSection`: Quote section interface with quotes array
- `Quote`: Individual quote interface
- `InfoSection`: Info section interface

## Helper Functions

Located in `src/data/exampleBlogData.ts`:

- `exampleBlogData`: Complete example blog data
- `getDefaultBlogSectionsData()`: Returns empty sections data structure
- `getDefaultHeroSection()`: Returns empty hero section structure
- `getDefaultQuoteSection()`: Returns empty quote section structure
- `getDefaultInfoSection()`: Returns empty info section structure

## Example Payload

```json
{
  "title": "Building a Modern Application with Next.js",
  "content": "Modern web applications require robust architecture...",
  "published": false,
  "tag_ids": [1, 3],
  "image_files": [],
  "meta_title": "Modern Web Application Development Guide",
  "meta_description": "Learn how to build scalable, performant web applications...",
  "sections_data": {
    "hero_section": {
      "title": "Building a Modern Web Application",
      "description": "Modern web applications require careful consideration...",
      "summary": "Learn the fundamentals",
      "image": ""
    },
    "quote_section": {
      "summary": "Learn from industry experts",
      "quotes": [
        {
          "title": "On readable code",
          "description": "Clarity beats cleverness",
          "quote": "Code is like humor. When you have to explain it, it's bad.",
          "quoteusername": "Cory House"
        }
      ]
    },
    "info_section": {
      "title": "Development Best Practices",
      "description": "Essential practices for building modern web applications",
      "summary": "Follow these guidelines",
      "summary_2": "Additional insights and advanced techniques",
      "image": ""
    }
  },
  "hero_section": {
    "title": "Building a Modern Web Application",
    "description": "Modern web applications require careful consideration...",
    "summary": "Learn the fundamentals",
    "image": ""
  },
  "quote_section": {
    "summary": "Learn from industry experts",
    "quotes": [
      {
        "title": "On readable code",
        "description": "Clarity beats cleverness",
        "quote": "Code is like humor. When you have to explain it, it's bad.",
        "quoteusername": "Cory House"
      }
    ]
  },
  "info_section": {
    "title": "Development Best Practices",
    "description": "Essential practices for building modern web applications",
    "summary": "Follow these guidelines",
    "summary_2": "Additional insights and advanced techniques",
    "image": ""
  }
}
```

## Usage Examples

### Creating a New Blog
```typescript
import { useBlogs } from "@/hooks/useBlogs";

const { addBlog } = useBlogs();

const blogData = {
  title: "My Blog Post",
  content: "Blog content here...",
  published: false,
  tag_ids: [1, 2],
  image_files: [],
  meta_title: "SEO Title",
  meta_description: "SEO Description",
  sections_data: getDefaultBlogSectionsData()
};

await addBlog.mutateAsync(blogData);
```

### Updating a Blog
```typescript
const { editBlog } = useBlogs();

await editBlog.mutateAsync({
  id: "blog-id",
  data: updatedBlogData
});
```

## Migration Notes

- Existing blogs without `sections_data` will continue to work
- The new fields are optional in the `BlogPost` interface
- Backward compatibility is maintained
- New blogs should include the complete sections structure

## Form Structure

### Basic Info Tab
- Blog title (required)
- Content (required, min 50 characters)
- Meta title (required)
- Meta description (required)
- Publish status toggle
- Tag selection

### Sections Tab
- **Hero Section**: Title, description, summary, image file upload
- **Quote Section**: Summary and dynamic quote management
  - Add/remove quotes
  - Each quote: title, description, quote text, author
- **Info Section**: Title, description, two summaries, image file upload

### Media Tab
- Blog images upload (required)
- OG image upload (optional)
- Image previews
- File validation

## Quote Management

The quote section provides dynamic quote management:

- **Add Quote**: Click "Add Quote Details" to add new quote entries
- **Remove Quote**: Each quote has a remove button
- **Quote Fields**: Each quote includes title, description, quote text, and author
- **Flexible**: Add as many quotes as needed

## Image Handling

### Section Images
- **Hero Section Image**: File upload with preview
- **Info Section Image**: File upload with preview
- **Image Previews**: Real-time preview of uploaded images
- **File Validation**: Accepts image files only

### Form Data Structure
When submitting the form, section images are handled as separate file fields:
- `hero_image`: Hero section image file
- `info_image`: Info section image file
- Section data is sent as JSON strings with image references

## Future Enhancements

- Rich text editing for sections
- Section templates
- Bulk section operations
- Advanced image management
- Section validation rules
- SEO optimization tools
- Quote templates and categories