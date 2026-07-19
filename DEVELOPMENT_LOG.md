# Development Log

Record of architectural decisions and development history.

## Milestone 1: Project Setup (2026-07-19)

### Decisions Made:
- **Framework:** Initialized the project with Next.js App Router and TypeScript to align with modern best practices for React frameworks.
- **Styling:** Setup Tailwind CSS v4 and initialized `shadcn/ui`. Shadcn was chosen for accessible, unstyled, and highly customizable components that fit enterprise SaaS needs.
- **API Client:** Selected Axios over native fetch to easily handle request interceptors (for auth headers) and global error responses (like catching 401s for token refresh/redirect logic).
- **Directory Structure:** Implemented a feature-based architecture to prevent the `components` directory from becoming a monolithic dump, ensuring high cohesion across modules like auth, companies, and attendance.

### Technical Debt / Limitations:
- Local storage is currently assumed for the auth token in `services/api.ts`. We may need to evaluate secure cookies if XSS vulnerabilities are a concern down the line, but local storage enables a fast start.

## Milestone 2: Theme & Design System (2026-07-19)

### Decisions Made:
- **Theme Provider:** Used `next-themes` mapped to the Tailwind `dark` class for seamless toggling.
- **Components:** Installed `shadcn/ui` primitives proactively to avoid interrupting flow later.
- **Toast Notifications:** Adopted `sonner` over the older `toast` component for a more modern, stacked notification experience.

## Milestone 3: Layout (2026-07-19)

### Decisions Made:
- **State Management:** Used Zustand (`useSidebarStore`) for sidebar collapse state instead of passing props, making the sidebar easily controllable from the Topbar (hamburger menu on mobile) and from within the sidebar itself.
- **Layout Architecture:** The `AppLayout` wraps only the authenticated portions of the application. This was placed in `app/(dashboard)/layout.tsx` using Next.js route groups so that the Auth pages (to be built next) can use a separate minimal layout without the sidebar/topbar.
- **Icons:** Standardized on `lucide-react` icons (default with shadcn) for all navigation elements to maintain a consistent visual language matching the UI design specs.

## Milestone 4: Authentication (2026-07-19)

### Decisions Made:
- **Form Handling:** Handled forms using `react-hook-form` with `zod` directly combined with `shadcn/ui` primitives (Input, Label, Button) instead of utilizing the `Form` wrapper, prioritizing speed and flexibility while maintaining validation rigidity.
- **API Communication:** Built an independent `auth.service.ts` connecting cleanly to the backend's `OAuth2PasswordRequestForm` route, using `application/x-www-form-urlencoded`.
- **Session Persistence:** Configured Zustand `persist` middleware to write the JWT directly to `localStorage`, allowing the Axios interceptor to read it synchronously before any protected request fires.
- **Route Protection:** Kept the `AuthGuard` client-side within the `AppLayout` wrapper. While Next.js middleware is an option, client-side guards provide a much faster integration since the state relies completely on Zustand's browser persistence.

## Milestone 6: Companies (2026-07-19)

### Decisions Made:
- **Reprioritization:** Decided to build the Core Data modules (Companies, Sites, Employees) before the Dashboard so that data naturally flows into the analytics layer.
- **Data Tables:** Adopted `@tanstack/react-table` combined with `shadcn/ui` table primitives for headless, highly customizable, and performant data grids.
- **Forms and Dialogs:** Used `shadcn/ui` Dialogs to overlay Create/Edit forms (powered by React Hook Form + Zod), providing a seamless, single-page experience instead of navigating to separate routes for editing.

## Milestone 8: Employees & Context (2026-07-19)

### Decisions Made:
- **Global Context Architecture:** Since most entities (Employees, Sites, Payscales) depend on a specific `company_id`, a `useCompanyStore` (Zustand) was introduced. The `Topbar` now features a global dropdown to switch contexts cleanly.
- **Missing Payroll API:** Discovered that while `/payscales` exists, `/payroll` calculations do not yet exist on the backend. Logged this as technical debt/pending backend work.
- **Strict Validation:** Configured rigorous Regex validation in Zod for Indian specific fields (PAN, Aadhaar, Phone, IFSC) matching the backend models.
