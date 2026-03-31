# Frontend Conventions

## Component Structure

- Pages live in `src/pages/`. One file per route.
- Reusable components live in `src/components/`.
- Hooks live in `src/hooks/`.
- Types live in `src/types/index.ts`. Mirror Prisma schema for type safety.

## Styling

- Tailwind CSS only. No inline styles. No CSS modules.
- Custom color palette in `tailwind.config.js`: `cre` (50–950), `success`, `warning`, `danger`, `signal-red`, `cool-grey`.
- Dark mode: class-based (`.dark` selector). Support it in new components.
- Fonts: Space Grotesk (sans), DM Serif Display (serif), Space Mono (mono).

## Routing

- All authenticated routes wrap in `<ProtectedRoute>`.
- Role-based rendering: check `user.role` to show/hide UI elements.
- Navigation sidebar in `AppShell.tsx`.

## Data Fetching (After Backend Exists)

- Use `@tanstack/react-query` for server state.
- Create hooks in `src/hooks/` (e.g., `useWorkOrders`, `useVendors`).
- Use Axios with a configured base URL and JWT interceptor.
- Invalidate queries after mutations.

## Accessibility

- Use semantic HTML elements.
- All interactive elements must be keyboard-navigable.
- Color is not the only indicator — pair with icons or text.
- Lucide React for all icons.
