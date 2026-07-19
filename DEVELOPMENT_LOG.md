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
