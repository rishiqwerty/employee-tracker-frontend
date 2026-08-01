# Changelog

All notable changes to the Employee Tracker Frontend will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.3.0] — 2026-08-01

### Added
- **Per-Employee Site Override in Attendance Register**:
  - Added dedicated **Site / Location column** with an interactive site selector dropdown for each worker row in `AttendanceSheetTable`.
  - Enabled override/custom site selection per worker for past or present daily attendance entries.
  - Updated `employeeSiteState` tracking and reactive `hasUnsavedChanges` detection to flag location modifications.
  - Updated `bulkMarkAttendance` payload in `services/attendance.service.ts` to transmit per-record `site_id` overrides to backend database.
- **Site-by-Site Earnings Breakdown on Payslips**:
  - Added site-by-site earnings itemization to `PayslipModal` for transferred workers.
  - Displays `Transferred (N Sites)` badge, location breakdown, days worked per site, site-specific daily wage rates, and per-site gross earnings.
  - Configured payslip header branding to prioritize `appBrandName` configured in Settings.

---

## [1.2.0] — 2026-08-01

### Commit Breakdown & Detailed Changes

#### [`2ae60d2`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/2ae60d2) — refactor: optimize company switching with state persistence, improved query placeholder data, and automatic filter resets
- **Company Switching Performance**:
  - Deferred store state updates in `CompanySelector` using `startTransition` and non-blocking micro-task execution (`setTimeout`) to prevent Radix UI pointer lock UI freezes.
  - Added `placeholderData: (previousData) => previousData` across queries in `EmployeesPage`, `EmployeesTable`, `AttendancePage`, `SitesPage`, and `DashboardPage` for seamless background data fetching without layout collapse.
  - Implemented automatic resetting of site, job role, and search filters on company context change.
  - Refactored `useCompanyStore` calls to use primitive atomic selectors (`state => state.activeCompanyId`) to eliminate unnecessary component re-renders.

#### [`c6db1e5`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/c6db1e5) — feat: add attendance pending warnings and unsaved changes protection to dashboard and attendance pages, plus configuration updates
- **Attendance Warnings & Data Loss Protection**:
  - Added amber alert warning banner on `Dashboard` and `Attendance` register when attendance is pending for today's date.
  - Added reactive unsaved changes detector on `Attendance` page with a pulsing action required banner and quick save button.
  - Added browser `beforeunload` event protection to prevent accidental tab closing when un-saved attendance modifications exist.

#### [`33a3485`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/33a3485) — feat: implement global loading indicator and standardized table loading component
- **Global Loading Progress Bar & Table Loading State**:
  - Added real-time global API activity loading progress bar in `Topbar` (`useIsFetching` & `useIsMutating`).
  - Added pulsing `Syncing...` status badge when network operations are active.
  - Created reusable `TableLoadingState` component with animated `Loader2` spinner and custom messages for all data tables.

#### [`1b06927`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/1b06927) — chore: configure query client defaults, update dev origins, and add Vercel project configuration
- **Query Client & Deployment Setup**:
  - Configured `QueryClient` defaults to disable window focus refetching and bypass automatic retries on HTTP 404, 401, and 403 errors.
  - Added Vercel project configuration (`vercel.json`) and updated development origin settings.

#### [`c14ec8b`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/c14ec8b) — refactor: standardize error handling with utility function and update API endpoint formatting
- **Error Handling Standardization**:
  - Created central `formatErrorMessage` utility to standardize API error extraction across toast alerts and form handlers.

---

## [1.1.0] — 2026-07-26

### Commit Breakdown & Detailed Changes

#### [`f831978`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/f831978) — feat: implement dynamic theme and accent color management with settings UI and persistence
- Added settings management interface for dynamic theme switching, accent colors, and custom system branding.

#### [`510f328`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/510f328) — feat: enhance login page UI with dynamic branding, glass-morphism, and demo credentials helper
- Redesigned `LoginPage` UI with glass-morphism aesthetic, dynamic company branding, and one-click demo credentials helper.

#### [`dc76b77`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/dc76b77) — feat: implement persistent system branding settings with backend config service and zustand store
- Integrated persistent branding settings connected to backend key-value config store and Zustand store.

#### [`b4a4079`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/b4a4079) — feat: implement server-side pagination for services and add a reusable TablePagination component
- Added reusable `TablePagination` component supporting custom page sizes and navigation controls.

#### [`76a5475`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/76a5475) — refactor: migrate payscale management to batch-update input interface
- Refactored `PayscaleDialog` to support batch daily wage entry across multiple designations in a single step.

#### [`e69da90`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/e69da90) — feat: add site details drawer and employee payslip generation modal with related table updates
- Created `SiteDetailsDrawer` displaying deployed site crew roster and active wage rules.
- Created employee payslip modal for generating formatted PDF/printable wage breakdown slips.

#### [`89adbf6`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/89adbf6) — feat: implement CompanySelector component and integrate into topbar, removing standalone companies link from sidebar
- Implemented `CompanySelector` dropdown integrated directly in `Topbar` for global context switching.

#### [`042ff1b`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/042ff1b) — feat: implement AddExpenseDialog to support recording employee advances and uniform deductions from the payroll table
- Implemented `AddExpenseDialog` for logging cash advances and uniform/equipment deductions.

#### [`6a2da79`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/6a2da79) — feat: implement payroll module with services for advances, deductions, and salary records, alongside a dedicated payroll table component and attendance tracking optimizations
- Implemented `PayrollTable` component and `payrollService` for tracking net salary computations, wage rates, and work days.

#### [`ede2308`](https://github.com/rishiqwerty/employee-tracker-frontend/commit/ede2308) — feat: implement daily attendance tracking page with bulk status management and site-specific filtering
- Built `AttendancePage` supporting bulk status marking (Present, Absent, Half Day, Leave, Holiday), site filtering, date navigation, and "Copy Yesterday" shortcut.

---

## [1.0.0] — 2026-07-19

### Initial Release
- Initial Next.js (App Router) project setup with TypeScript and Tailwind CSS v4.
- Installed core dependencies: `shadcn/ui`, `zustand`, `react-hook-form`, `zod`, `@tanstack/react-query`, `axios`, `recharts`, `lucide-react`, `next-themes`, and `sonner`.
- Feature-based directory structure (`features/`, `components/`, `hooks/`, `services/`, etc.).
- Base Axios API client with request interceptors for auth tokens in `services/api.ts`.
- `ThemeProvider` using `next-themes` for Light/Dark mode support.
- `AppLayout`, `Sidebar`, and `Topbar` components.
- `LoginPage` with Zod validation and JWT auth state management (`useAuthStore`).
- Core Companies and Employees CRUD modules with `@tanstack/react-table` integration.
