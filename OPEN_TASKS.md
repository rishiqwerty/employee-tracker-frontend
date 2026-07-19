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

## Milestone 6: Companies
- [x] Create `services/companies.service.ts`
- [x] Build `CompanyDialog` (Create/Edit form)
- [x] Build `CompaniesTable` (TanStack Table)
- [x] Integrate into `app/(dashboard)/companies/page.tsx`

## Milestone 7: Sites & Departments
- [ ] Implement Sites CRUD table and API service.
- [ ] Connect Sites to Companies via `company_id`.
- [ ] (Optional) Implement Departments management.

## Milestone 8: Employees & Context
- [x] Create `store/useCompanyStore.ts` (Global Company Context).
- [x] Update `Topbar` with Company Selector dropdown.
- [x] Create `services/employees.service.ts`.
- [x] Build `EmployeeDialog` (Create/Edit form with Zod).
- [x] Build `EmployeesTable` (TanStack Table).
- [x] Integrate into `app/(dashboard)/employees/page.tsx`.

## Milestone 9: Payscales
- [ ] Implement Payscales CRUD table and API service.
- [ ] Connect Payscales to Companies via `company_id`.

## Technical Debt & Follow-ups
- [ ] **Payroll Module:** The backend lacks `/payroll` endpoints. The frontend payroll module is blocked until these are implemented.
- [ ] Need to decide between localStorage vs httpOnly cookies for authentication token storage.
