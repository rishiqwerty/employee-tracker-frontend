# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial Next.js (App Router) project setup with TypeScript and Tailwind CSS v4.
- Installed core dependencies: `shadcn/ui`, `zustand`, `react-hook-form`, `zod`, `@tanstack/react-query`, `axios`, `recharts`, `lucide-react`, `next-themes`, and `sonner`.
- Set up feature-based directory structure (`features/`, `components/`, `hooks/`, `services/`, etc.).
- Configured a base Axios API client with request interceptors for auth tokens in `services/api.ts`.
- Initialized `shadcn/ui` with default configuration and installed the core Button utility component.
- Implemented `ThemeProvider` using `next-themes` to support Light/Dark mode.
- Installed foundational `shadcn/ui` components (Card, Input, Label, Select, Dropdown Menu, Avatar, Table, Badge, Dialog).
- Integrated `sonner` Toaster in the root layout for global notifications.
- Created `AppLayout` wrapper component to coordinate sidebar and topbar structure.
- Implemented responsive `Sidebar` with state management via Zustand (`useSidebarStore`).
- Implemented `Topbar` featuring global search, theme toggle, and user navigation dropdown.
- Created the initial Dashboard placeholder utilizing the layout.
- Implemented robust `LoginPage` using `react-hook-form` and `zod` schema validation.
- Configured TanStack React Query global `QueryProvider` to handle data mutations/fetching.
- Built a Zustand store (`useAuthStore`) with local storage persist middleware to persist JWT tokens.
- Set up an `AuthGuard` component to protect dashboard routes and handle unauthenticated redirects.
- Connected the login page with the backend `/auth/login` endpoint using `OAuth2PasswordRequestForm` structure.
- Developed the Core Companies Module with full CRUD capabilities.
- Integrated `@tanstack/react-table` for displaying company data.
- Built a responsive `CompanyDialog` with Zod validation for creating and editing company records.
- Implemented a Global Company Context using Zustand (`useCompanyStore`) and added a company selector to the Topbar.
- Developed the Core Employees Module with full CRUD capabilities, scoped to the globally selected Company.
- Built a large multi-column `EmployeeDialog` handling complex validations for names, phone numbers, and banking details.
