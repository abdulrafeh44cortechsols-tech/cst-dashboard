# Service Structure Documentation

## Overview

The service system has been updated to support a comprehensive `sections_data` structure that allows for rich, structured content beyond basic service information.

## New Service Payload Structure

### Basic Fields
- `title`: Service title
- `description`: Service description
- `is_active`: Boolean indicating if service is active
- `meta_title`: SEO meta title
- `meta_description`: SEO meta description
- `sections_data`: Object containing all service sections

### Sections Data Structure

The `sections_data` object contains the following sections:

#### 1. hero_section
- `title`: Hero section title
- `description`: Hero section description
- `sub_sections`: Array of objects with `title` and `description`

#### 2. about_section
- `title`: About section title
- `description`: About section description
- `sub_sections`: Array of objects with `title` and `description`

#### 3. why_choose_us_section
- `title`: Why choose us section title
- `description`: Why choose us section description
- `sub_sections`: Array of objects with `title` and `description`

#### 4. what_we_offer_section
- `title`: What we offer section title
- `description`: What we offer section description
- `sub_sections`: Array of objects with `title` and `description`

#### 5. perfect_business_section
- `title`: Perfect for business section title
- `description`: Perfect for business section description
- `sub_sections`: Array of objects with `title` and `description`

#### 6. design_section
- `title`: Design process section title
- `description`: Design process section description
- `sub_sections`: Array of objects with `title` and `description`

#### 7. team_section
- `title`: Team section title
- `description`: Team section description
- `sub_sections`: Array of team member objects with:
  - `name`: Team member name
  - `designation`: Job title
  - `experience`: Years of experience
  - `summary`: Brief description

#### 8. tools_used_section
- `title`: Tools section title
- `description`: Tools section description
- `sub_sections`: Array of objects with `title` and `description`

#### 9. client_feedback_section
- `title`: Client feedback section title
- `description`: Client feedback section description
- `sub_sections`: Array of feedback objects with:
  - `name`: Client name
  - `designation`: Client job title
  - `comment`: Feedback comment
  - `stars`: Rating (1-5)

## Example Payload

```json
{
  "title": "UI/UX Design Service",
  "description": "Professional UI/UX design for web and mobile.",
  "is_active": true,
  "meta_title": "UI/UX Design Service",
  "meta_description": "User-centered design, research, and prototyping.",
  "sections_data": {
    "hero_section": {
      "title": "Design That Delivers",
      "description": "Beautiful, usable, effective.",
      "sub_sections": [ 
        { "title": "200+ Projects", "description": "Proven results" },
        { "title": "98% Satisfaction", "description": "Clients love the outcomes" }
      ]
    },
    "about_section": {
      "title": "About This Service",
      "description": "Strategy + execution from research to delivery.",
      "sub_sections": [
        { "title": "User‑Centered", "description": "Research & testing" },
        { "title": "Systematic", "description": "Design systems" },
        { "title": "Measurable", "description": "Business impact"}
      ]
    }
    // ... other sections
  }
}
```

## API Endpoints

### Create Service
- **POST** `/api/v1/services/`
- Accepts both `FormData` and `CreateServiceData` objects
- Returns created service

### Update Service
- **PATCH** `/api/v1/services/{id}/`
- Accepts both `FormData` and `CreateServiceData` objects
- Returns updated service

### Get Services
- **GET** `/api/v1/services/`
- Returns array of services

### Delete Service
- **DELETE** `/api/v1/services/{id}/`
- Deletes service by ID

## Frontend Components

### Service Creation Form
- Located at `/dashboard/services/new`
- Comprehensive form for all sections
- Dynamic sub-section management
- Validation for required fields

### Service Edit Modal
- Tabbed interface (Basic Info + Sections)
- Pre-populated with existing data
- Same comprehensive editing capabilities

### Service List
- Displays services in card format
- Shows basic information (title, description, status)
- Edit and delete actions

## TypeScript Types

All types are defined in `src/types/types.ts`:

- `Service`: Complete service interface
- `CreateServiceData`: Data structure for creating/updating services
- `ServiceSectionsData`: Complete sections data structure
- `ServiceSection`: Generic section interface
- `TeamSection`: Team-specific section interface
- `ClientFeedbackSection`: Client feedback section interface

## Helper Functions

Located in `src/data/exampleServiceData.ts`:

- `exampleServiceData`: Complete example service data
- `getDefaultSectionsData()`: Returns empty sections data structure

## Usage Examples

### Creating a New Service
```typescript
import { useServices } from "@/hooks/useServices";

const { addService } = useServices();

const serviceData = {
  title: "My Service",
  description: "Service description",
  is_active: true,
  meta_title: "SEO Title",
  meta_description: "SEO Description",
  sections_data: getDefaultSectionsData()
};

await addService.mutateAsync(serviceData);
```

### Updating a Service
```typescript
const { editService } = useServices();

await editService.mutateAsync({
  id: "service-id",
  data: updatedServiceData
});
```

## Migration Notes

- Existing services without `sections_data` will still work
- The `sections_data` field is optional in the `Service` interface
- Backward compatibility is maintained
- New services should include the complete sections structure

## Future Enhancements

- Image support for sections
- Rich text editing for descriptions
- Section templates
- Bulk section operations
- Section validation rules 