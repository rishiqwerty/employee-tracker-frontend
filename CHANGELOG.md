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
