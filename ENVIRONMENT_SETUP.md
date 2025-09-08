# Environment Setup Guide

## Overview

This guide explains how to configure environment variables for different development and production environments, including support for devtunnels.ms domains.

## Environment Variables

### Required Variables

Create a `.env.local` file in your project root:

```bash
# Development (Local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development (DevTunnels)
NEXT_PUBLIC_API_URL=https://vfv2pt7z-8000.inc1.devtunnels.ms

# Staging
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com

# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Environment File Structure

```
your-project/
├── .env.local          # Local development (gitignored)
├── .env.example        # Example configuration (committed)
├── .env.staging        # Staging environment
└── .env.production     # Production environment
```

## Next.js Image Configuration

The `next.config.ts` file is configured to allow images from:

- `localhost:8000` (HTTP and HTTPS)
- `*.devtunnels.ms` (HTTPS)
- `127.0.0.1`
- `images.unsplash.com`

### Configuration Details

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: '*.devtunnels.ms',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
    },
    {
      protocol: 'https',
      hostname: 'localhost',
      port: '8000',
    },
  ],
  domains: [
    "127.0.0.1", 
    "localhost",
    "*.devtunnels.ms"
  ],
}
```

## URL Transformation

The `getImageUrl()` utility function automatically handles URL transformations:

### Localhost URLs
```typescript
// Input
"http://localhost:8000/media/blog_images/image.png"

// Output (with NEXT_PUBLIC_API_URL=https://api.yourdomain.com)
"https://api.yourdomain.com/media/blog_images/image.png"
```

### DevTunnels URLs
```typescript
// Input
"https://vfv2pt7z-8000.inc1.devtunnels.ms/media/blog_images/image.png"

// Output (with NEXT_PUBLIC_API_URL=https://api.yourdomain.com)
"https://api.yourdomain.com/media/blog_images/image.png"
```

## Development Environments

### 1. Local Development
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. DevTunnels Development
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://vfv2pt7z-8000.inc1.devtunnels.ms
```

### 3. Staging
```bash
# .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

### 4. Production
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Usage in Components

All image displays automatically use the `getImageUrl()` function:

```typescript
import { getImageUrl } from "@/lib/utils";

// In your component
<Image
  src={getImageUrl(post.images?.[0])}
  alt={post.title}
  width={400}
  height={240}
/>
```

## Troubleshooting

### Common Issues

1. **Images not loading**: Check if the domain is allowed in `next.config.ts`
2. **Wrong URLs**: Verify `NEXT_PUBLIC_API_URL` is set correctly
3. **DevTunnels errors**: Ensure the domain pattern `*.devtunnels.ms` is included

### Debug Steps

1. **Check environment variable**:
   ```bash
   echo $NEXT_PUBLIC_API_URL
   ```

2. **Verify Next.js config**:
   - Restart development server after config changes
   - Check browser console for image loading errors

3. **Test URL transformation**:
   ```typescript
   console.log(getImageUrl("http://localhost:8000/media/image.png"));
   ```

## Security Considerations

- **Environment Variables**: Only use `NEXT_PUBLIC_*` for client-side variables
- **Image Domains**: Restrict to trusted domains only
- **Production**: Use HTTPS URLs in production environments

## Deployment

### Vercel
- Set environment variables in Vercel dashboard
- Use `NEXT_PUBLIC_API_URL` for client-side access

### Other Platforms
- Set environment variables according to platform requirements
- Ensure `NEXT_PUBLIC_API_URL` is accessible to the client

## Best Practices

1. **Never commit sensitive data** in environment files
2. **Use different URLs** for different environments
3. **Test image loading** in all environments
4. **Monitor image loading errors** in production
5. **Keep Next.js config updated** with new domains 