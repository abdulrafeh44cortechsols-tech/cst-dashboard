# Dashboard Next.js

CortechSols Dashboard built with Next.js, featuring comprehensive content management capabilities.

## Features

- **Authentication System**: Secure login with OTP verification for admins and editors
- **Route Protection**: Role-based access control throughout the application
- **Content Management**: Blogs, services, projects, pages, and media management
- **User Management**: Admin-controlled editor accounts
- **SEO Tools**: Meta tags, analytics integration, and optimization features

## Authentication & Security

### Route Protection

The dashboard implements a multi-layered authentication system:

1. **Global Auth Provider** (`AuthProvider`): Manages authentication state and redirects unauthenticated users to login
2. **Dashboard Layout Protection** (`AuthenticatedRoute`): Ensures only authenticated users can access dashboard
3. **Page-Level Protection**: Specific pages use role-based guards:
   - `AdminOnlyRoute`: Restricts access to admin users only
   - `EditorOnlyRoute`: Restricts access to editor users only
   - `AuthenticatedRoute`: Allows both admin and editor access

### Protected Areas

- **Admin Only**:
  - Editor Management (`/dashboard/editors`)
  - Settings (`/dashboard/settings`)
  - SEO Management (`/dashboard/seo`)
  - Tags Management (`/dashboard/tags`)
  - Media Management (`/dashboard/media`)

- **Admin & Editor Access**:
  - Dashboard Overview (`/dashboard`)
  - Blogs Management (`/dashboard/blogs`)
  - Services Management (`/dashboard/services`)
  - Projects Management (`/dashboard/projects`)
  - Pages Management (`/dashboard/pages`)

### Usage Examples

```tsx
// For admin-only pages
import { AdminOnlyRoute } from "@/components/RouteGuard";

export default function AdminPage() {
  return (
    <AdminOnlyRoute>
      <div>Admin content here</div>
    </AdminOnlyRoute>
  );
}

// For authenticated pages (admin or editor)
import { AuthenticatedRoute } from "@/components/RouteGuard";

export default function ContentPage() {
  return (
    <AuthenticatedRoute>
      <div>Content accessible to both admin and editor</div>
    </AuthenticatedRoute>
  );
}

// Using the role-based access hook
import { useRoleBasedAccess } from "@/components/RouteGuard";

export default function ConditionalContent() {
  const { isAdmin, isEditor, hasRole } = useRoleBasedAccess();
  
  return (
    <div>
      {isAdmin && <AdminOnlyFeature />}
      {hasRole(['admin', 'editor']) && <SharedFeature />}
    </div>
  );
}
```

### Authentication Flow

1. User visits any protected route
2. `AuthProvider` checks for stored authentication
3. If no auth found, redirects to `/login`
4. If auth found, validates token with backend
5. If token invalid, clears auth and redirects to `/login`
6. If valid, allows access to dashboard
7. Individual pages check role permissions as needed

### Login Process

1. User selects admin or editor login type
2. Enters credentials
3. Backend validates and sends OTP via email
4. User enters OTP for verification
5. On successful OTP verification, receives JWT token
6. Token stored in localStorage for session persistence
7. Redirected to dashboard

## Content Validation Requirements

### Minimum Character Lengths

All summary and description fields (except basic information like titles) now require a minimum of **100 characters** to ensure quality content:

#### Blog Content
- **Blog Content**: Minimum 100 characters
- **Hero Section Description**: Minimum 100 characters  
- **Hero Section Summary**: Minimum 100 characters
- **Quote Section Summary**: Minimum 100 characters
- **Info Section Description**: Minimum 100 characters
- **Info Section Summary**: Minimum 100 characters
- **Info Section Summary 2**: Minimum 100 characters

#### Service Content
- **Service Description**: Minimum 100 characters
- **Section Descriptions**: Minimum 100 characters (all service sections)
- **Sub-section Descriptions**: Minimum 100 characters

#### Project Content  
- **Project Description**: Minimum 100 characters
- **Hero Section Description**: Minimum 100 characters
- **About Section Description**: Minimum 100 characters
- **Technologies Section Description**: Minimum 100 characters
- **Services Section Description**: Minimum 100 characters
- **Sub-section Descriptions**: Minimum 100 characters (all applicable sections)

#### Industry Content
- **Industry Description**: Minimum 100 characters

### Character Count Indicators

Form fields display character counts with updated minimum requirements:
- Services: "X/2000 characters (minimum 100 required)"
- Projects: "X/2000 characters (minimum 100 required)"  
- Industries: "X/1000 characters (minimum 100 required)"

### Validation Behavior

- Forms validate minimum character requirements on submission
- Clear error messages specify which field needs more content
- Validation applies to both creation and editing forms
- Section-level validation ensures comprehensive content quality

## Form Error Handling

### Blog Creation Form Error Handling

The blog creation form now includes comprehensive error handling with **required section data**:

#### **Real-time Validation**
- **Instant Feedback**: Errors appear immediately when fields lose focus (onBlur)
- **Error Clearing**: Errors automatically clear when users start typing valid content
- **Visual Indicators**: Invalid fields show red borders and error icons
- **Character Counters**: Live character counts with minimum/maximum requirements

#### **Comprehensive Field Validation**

**Basic Information Fields:**
- **Title**: Required, 5-40 characters, real-time validation
- **URL Slug**: Required, 3-40 characters, lowercase letters/numbers/hyphens only
- **Content**: Required, minimum 100 characters
- **Meta Title**: Required, 5-40 characters
- **Meta Description**: Required, 50-300 characters

**Media Validation:**
- **Blog Images**: At least one image required
- **File Type**: Only image files accepted

**Section-Level Validation (All Required):**
- **Hero Section**: 
  - Title (Required, ≤40 chars)
  - Description (Required, ≥100 chars, ≤1000 chars)
  - Summary (Required, ≥100 chars, ≤400 chars)
- **Quote Section**: 
  - Summary (Required, ≥100 chars, ≤400 chars)
  - At least one quote required with title, description, quote text, and author
- **Info Section**: 
  - Title (Required, ≤40 chars)
  - Description (Required, ≥100 chars, ≤1000 chars)
  - Summary (Required, ≥100 chars, ≤400 chars)
  - Summary 2 (Required, ≥100 chars, ≤400 chars)

**Security Validation:**
- **reCAPTCHA**: Required completion before form submission

#### **Section Data Requirement**

🔥 **IMPORTANT**: All blog sections (Hero, Quote, and Info) are now **mandatory** for creating a new blog. The blog cannot be submitted without complete section data including:

- All required fields filled with valid content
- Proper character limits met
- At least one quote in the quote section
- All validation rules satisfied

This ensures every blog has comprehensive, structured content that meets quality standards.

#### **Error Display Features**

- **Error Messages**: Clear, specific error descriptions with icons
- **Field Highlighting**: Invalid fields show red borders
- **Error Positioning**: Errors appear below relevant fields
- **Character Counters**: Show remaining/required characters
- **Form Submission**: Consolidated validation prevents submission with errors

#### **User Experience Enhancements**

```tsx
// Example error handling pattern
<Input
  value={title}
  onChange={(e) => {
    setTitle(e.target.value);
    // Clear error when user starts typing
    if (errors.title) {
      clearError('title');
    }
  }}
  onBlur={() => {
    // Validate when field loses focus
    const error = validateTitle(title);
    if (error) {
      setError('title', error);
    }
  }}
  className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
/>
<ErrorMessage message={errors.title} />
```

#### **Validation Functions**

- **Individual Validators**: Separate validation functions for each field type
- **Section Validators**: Comprehensive validation for blog sections
- **Form Validator**: Master validation function called on submission
- **Error Management**: Centralized error state management with utilities

#### **Error State Management**

```typescript
// Error state structure
const [errors, setErrors] = useState<{
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  images?: string;
  heroSection?: {
    title?: string;
    description?: string;
    summary?: string;
  };
  // ... other sections
  captcha?: string;
}>({});
```

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Protected dashboard routes
│   ├── login/             # Public login page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/
│   ├── RouteGuard.tsx     # Authentication guards
│   ├── auth-provider.tsx  # Global auth context
│   └── ...
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── lib/
│   └── auth.ts           # Auth utilities
└── services/
    └── auth.ts           # Auth API calls
```
