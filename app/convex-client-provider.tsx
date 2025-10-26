"use client"; // Marks this as a client component (runs in browser, not server)

import { ConvexReactClient } from "convex/react"; // Client for React apps
import { ConvexProvider } from "convex/react"; // Provider component to share client with app

// Creates connection to Convex backend using your project URL from .env.local
// The ! tells TypeScript "this env variable definitely exists"
const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Wrapper component that provides Convex to entire app
// Used in: layout.tsx to wrap all pages
// Enables: useQuery and useMutation hooks in components
export function ConvexClientProvider(
  { children }: { children: React.ReactNode } // Accepts child components to wrap
) {
  // Returns ConvexProvider wrapping all children, giving them access to Convex
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
