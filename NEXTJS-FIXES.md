# Next.js 15.3+ Migration Fixes

## Overview

This document outlines the changes made to ensure compatibility with Next.js 15.3+ and fix critical build errors related to the `useSearchParams()` hook and parallel routes.

## Key Changes

### 1. Added Suspense Boundaries

In Next.js 15.3+, any component that uses `useSearchParams()` must be wrapped in a Suspense boundary. We've fixed this by:

- Wrapping `ApplicationClient` in a Suspense boundary in `/application/page.tsx`
- Wrapping `ApplicationSuccessClient` in a Suspense boundary in `/application/success/page.tsx`
- Adding appropriate fallback UI for both components

### 2. Removed Server-Side searchParams Usage

- Removed the `searchParams` prop from server components
- Ensured all URL parameter handling happens in client components

### 3. Fixed Parallel Routes Conflict

- **Problem**: Build error due to conflicting routes at the `/health` path
    ```plaintext
  You cannot have two parallel pages that resolve to the same path. Please check /health/page and /health/route.
  ```
- **Solution**:
  - Removed the redundant `/src/app/health/page.tsx` file
  - Kept the API route handler `/src/app/health/route.ts`
  - Added documentation about health check endpoints in `docs/health-check-endpoints.md`

### 4. Updated Next.js Configuration

- Removed deprecated `swcMinify` option from `next.config.js`
- Cleaned up formatting in the Next.js configuration file
- Updated component structure to follow Next.js 15.3+ best practices

### 3. Client Component Structure

Client components are now properly structured to:

- Import `useSearchParams` from 'next/navigation'
- Use React hooks to manage state based on URL parameters
- Render conditional UI based on parameters retrieved from the URL

### 4. Fallback UI

Added appropriate fallback UI for components that are loading:

- "Loading application form..." for the application page
- "Loading application details..." for the success page

## Testing

After implementing these fixes, the application should:

- Build without errors
- Properly handle URL parameters
- Show appropriate loading states during navigation
- Maintain all functionality while being compatible with Next.js 15.3+

## Future Considerations

When working with Next.js 15.3+ applications:

1. Always wrap components using `useSearchParams()` in a Suspense boundary
2. Avoid using `searchParams` in server components
3. Create dedicated client components for handling URL parameter logic
4. Consider the user experience during loading states with appropriate fallback UI
