# CortechSols Website Dashboard

A Next.js dashboard for managing CortechSols website content.

## Features

### Template Management
- **Dynamic Template Types**: Fetches available template types from `/api/v1/pages/template_types/`
- **Template Versions**: Supports multiple versions per template (e.g., v1, v2)
- **Template Preview**: View templates with custom URLs
- **Template Selection**: Pre-select templates when creating new pages

### Page Management
- **Template Integration**: Create pages with specific template types and versions
- **Dynamic Forms**: Template selection based on API data
- **Version Support**: Automatic template_type formatting (e.g., `homepage_v1`)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This URL is used for template preview links.

## API Integration

### Template Types API
- **Endpoint**: `/api/v1/pages/template_types/`
- **Response**: Returns available template types with versions
- **Usage**: Used in page creation forms and template gallery

### Template Preview URLs
- **Format**: `${NEXT_PUBLIC_SITE_URL}/templates/${template_type}`
- **Example**: `https://yourdomain.com/templates/homepage_v1`

## Usage

### Creating Pages with Templates
1. Navigate to `/dashboard/pages/new`
2. Select template name and version from dropdowns
3. Template type is automatically formatted as `template_name_version`
4. Submit to create page with selected template

### Viewing Templates
1. Navigate to `/dashboard/template`
2. Browse available templates with versions
3. Click "View" to open template preview in new tab
4. Click "Use" to create a new page with that template

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
