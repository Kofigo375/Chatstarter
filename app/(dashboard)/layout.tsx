// Dashboard Layout Wrapper
// Purpose: Protects all dashboard pages - only logged-in users can access
// Location: Wraps all pages in app/(dashboard)/ folder (Next.js route groups)
// Connected to: Clerk (authentication), ConvexClientProvider (auth state)
// Flow: User visits dashboard → Check auth → Show content OR redirect to sign-in

"use client"; // Runs in browser (needed for Clerk and Convex auth components)

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Sidebar,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarFooter, // This is the Sidebar component from shadcn
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { RedirectToSignIn, SignOutButton } from "@clerk/nextjs"; // Clerk component - redirects to sign-in page
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Authenticated, Unauthenticated, useQuery } from "convex/react"; // Convex auth state components
import { PlusIcon, User2Icon } from "lucide-react";
import Link from "next/link"; // ✅Correct import for navigation
import { DropdownMenu, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Layout component for all dashboard pages
// Used by: All pages in app/(dashboard)/ folder automatically (Next.js convention)
// Props: children = The actual page content (from page.tsx files)
export default function DashboardLayout({
  children, // Content from dashboard pages (friends, DMs, servers, etc.)
}: {
  children: React.ReactNode; // TypeScript: children can be any valid React content
}) {
  return (
    <>
      {/* Show dashboard content ONLY if user is logged in */}
      {/* Connected to: Clerk authentication state via ConvexClientProvider */}
      <Authenticated>
        <SidebarProvider>
          <DashboardSidebar />
          {children} {/* Renders the actual page content (page.tsx) */}
        </SidebarProvider>
      </Authenticated>

      {/* Show sign-in redirect if user is NOT logged in */}
      {/* Prevents unauthorized access to dashboard pages */}
      <Unauthenticated>
        <RedirectToSignIn /> {/* Clerk redirects to sign-in page */}
      </Unauthenticated>
    </>
  );
}

function DashboardSidebar() {
  const user = useQuery(api.functions.user.get);

  if (!user) {
    return null; // Or a loading state
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/friends">
                    <User2Icon />
                    Friends
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroup>
            <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            <SidebarGroupAction>
              <PlusIcon />
              <span className="sr-only">New Direct Message</span>
            </SidebarGroupAction>
          </SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex items-center">
                <Avatar>
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <p>{user.username}</p>
                </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <SignOutButton />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
