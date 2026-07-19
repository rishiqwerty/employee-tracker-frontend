# Open Tasks

Living document aligned with `PROJECT_SPEC.md` to track remaining and newly identified tasks.

## Milestone 1: Project Setup
- [x] Initialize Next.js project (App Router, TS, Tailwind)
- [x] Install core dependencies
- [x] Create modular folder structure
- [x] Configure API client (Axios interceptors)

## Milestone 2: Theme & Design System
- [x] Setup `next-themes` for Light/Dark mode
- [x] Initialize `shadcn/ui` and configure core colors
- [x] Create foundational UI components (Buttons, Inputs, Cards, etc.)

## Milestone 3: Layout
- [x] Create `AppLayout` wrapper
- [x] Implement responsive `Sidebar`
- [x] Implement `Topbar` (Search, User Profile, Theme Toggle)

## Milestone 4: Authentication
- [ ] Build Login UI screen
- [ ] Integrate with backend `/auth` endpoint
- [ ] Implement session persistence logic
- [ ] Secure dashboard routes behind an auth guard

## Technical Debt & Follow-ups
- [ ] Need to decide between localStorage vs httpOnly cookies for authentication token storage.
- [ ] Confirm exactly which API endpoints the frontend should expect for "Employees" and "Payroll" since they are not currently visible in the backend router setup but might be needed soon.
