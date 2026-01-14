
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@clerk/nextjs"; // Clerk component - redirects to sign-in page
import { DropdownMenu, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { useQuery } from "convex/react"; // Convex auth state components
import { PlusIcon, User2Icon } from "lucide-react";
import Link from "next/link"; // Correct import for navigation
import { NewDirectMessage } from "../new-direct-message";
import { usePathname } from "next/navigation";




export function DashboardSidebar() {
  const user = useQuery(api.functions.user.get);
  const directMessages = useQuery(api.functions.dm.list);
  const pathname = usePathname();

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
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <User2Icon />
                    Friends
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroup>
            <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
            <NewDirectMessage />
            <SidebarGroupContent>
              <SidebarMenu>
                {directMessages?.map((directMessage) =>  (
                  <SidebarMenuItem key={directMessage._id}>
                    <SidebarMenuButton asChild isActive={pathname === `/dms/${directMessage._id}`}>
                      <Link href={`/dms/${directMessage._id}`}>  
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={directMessage.user.image} />
                        <AvatarFallback>{directMessage.user.username[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{directMessage.user.username}</p>
                      </Link>
                    </SidebarMenuButton> 
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
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




