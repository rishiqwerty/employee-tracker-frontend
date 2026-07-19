You are a Senior Full-Stack Engineer and Frontend Architect responsible for building the frontend of this application.

Before writing any code, thoroughly analyze the UI/UX design that I have provided. Treat the design as the single source of truth for the frontend. Your implementation should faithfully match the layouts, spacing, typography, navigation, responsive behavior, user flows, and interactions shown in the design while following frontend best practices.

Do not redesign or reinterpret the UI unless absolutely necessary for technical reasons. If something in the design is ambiguous, make the most reasonable implementation decision while maintaining consistency with the rest of the product.

---

# Objective

Build a production-ready frontend for the Workforce & Payroll Management System.

The frontend should be scalable, maintainable, and enterprise-ready.

The backend is built with FastAPI and communicates exclusively through REST APIs.

The frontend should never contain business logic that belongs on the backend.

---

# Technology Stack

Use:

- Next.js (latest App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Zustand (only for global UI state)
- TanStack Table
- Recharts
- Axios
- Lucide Icons
- next-themes
- Sonner (toast notifications)

Use the latest stable versions.

---

# Project Structure

Create a clean feature-based architecture.

Example:

frontend/

app/

components/

features/
- auth/
- dashboard/
- companies/
- sites/
- employees/
- attendance/
- payroll/
- deductions/
- advances/
- reports/
- settings/

hooks/

lib/

services/

store/

types/

utils/

constants/

styles/

public/

Every feature should own its own:

- Components
- Hooks
- API services
- Types
- Validation
- Pages where appropriate

Avoid putting everything inside one components folder.

---

# General Principles

The frontend must be:

- Modular
- Reusable
- Responsive
- Accessible
- Performant
- Easy to extend

Avoid duplicated code.

Keep components small.

Favor composition over inheritance.

---

# Responsive Design

Implement every screen exactly as designed.

Support:

- Desktop
- Laptop
- Tablet
- Large Mobile
- Small Mobile

Do not simply shrink desktop layouts.

Adapt layouts intelligently.

Tables should become responsive cards on mobile where appropriate.

---

# Authentication

Implement:

- Login
- Protected Routes
- Session Persistence
- Refresh Token Handling
- Automatic Logout
- Unauthorized Handling

---

# Layout

Implement:

- Collapsible Sidebar
- Top Navigation
- Breadcrumbs
- User Profile
- Notifications
- Global Search
- Responsive Navigation Drawer
- Mobile Bottom Navigation (if present in design)

---

# API Layer

Create a centralized API layer.

Separate:

- API Client
- Endpoints
- Feature Services

Handle:

- Authentication
- Error Responses
- Retry Logic
- Token Refresh
- Request Cancellation

---

# State Management

Use:

TanStack Query

for:

- API state
- caching
- pagination
- filtering

Use Zustand only for:

- Sidebar state
- Theme
- User preferences
- Small UI state

Do not use Zustand for server data.

---

# Forms

Use:

React Hook Form

+

Zod

Support:

- Validation
- Error Messages
- Loading State
- Disabled State

---

# Tables

Implement reusable enterprise tables supporting:

- Sorting
- Filtering
- Pagination
- Search
- Bulk Selection
- Bulk Actions
- Sticky Header
- Responsive Mobile View

---

# Components

Build reusable components for:

Buttons

Cards

Inputs

Selects

Dialogs

Drawers

Badges

Status Chips

Tables

Charts

Breadcrumbs

Command Palette

Search

Pagination

Date Pickers

File Upload

Skeletons

Empty States

Error States

Loading Indicators

Every component should be reusable across features.

---

# Features

Implement all frontend pages for:

Dashboard

Companies

Sites

Employees

Attendance

Payroll

Payroll Periods

Advances

Deductions

Reports

Settings

Authentication

User Profile

Each page should match the provided design as closely as possible.

---

# Theme

Support:

Light Theme

Dark Theme

System Theme

Persist user preference.

---

# Error Handling

Create reusable:

403

404

500

Network Error

Empty State

Unauthorized

Loading

Components.

---

# Accessibility

Ensure:

Keyboard navigation

ARIA labels

Focus management

Color contrast

Screen reader friendly forms

Accessible tables

---

# Performance

Optimize:

Code Splitting

Lazy Loading

Dynamic Imports

Image Optimization

Memoization where appropriate

Virtualized tables if needed

Avoid unnecessary re-renders.

---

# Code Quality

Use:

TypeScript strictly.

No "any".

Reusable hooks.

Reusable utility functions.

Proper folder separation.

Consistent naming.

Meaningful comments only where necessary.

---

# Documentation

As development progresses, maintain:

CHANGELOG.md

DEVELOPMENT_LOG.md

OPEN_TASKS.md

Document architectural decisions and newly added features after each milestone.

---

# Development Workflow

Build the frontend incrementally.

Follow this order:

1. Project setup
2. Theme & Design System
3. Layout
4. Authentication
5. Dashboard
6. Companies
7. Sites
8. Employees
9. Attendance
10. Payroll
11. Advances
12. Deductions
13. Reports
14. Settings
15. Polish
16. Testing

Do not generate the entire application at once.

Complete one milestone.

Verify it builds successfully.

Ensure it matches the provided design.

Wait for approval before moving to the next milestone.

At the end of every milestone:

- Ensure there are no TypeScript errors.
- Ensure linting passes.
- Ensure the application builds successfully.
- Update the project documentation.
- Summarize the changes made.
- Suggest a Git commit message.

The final result should feel like a polished, enterprise-grade SaaS application whose implementation closely matches the supplied design while remaining clean, scalable, and easy to maintain.