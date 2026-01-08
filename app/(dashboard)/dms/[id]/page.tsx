"use client";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { use } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";

// Page component for individual direct message thread
// Used in: app/(dashboard)/dms/[id]/page.tsx

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const user = useQuery(api.functions.user.get);

  if (!user) {
    return null; // Or a loading state
  }

  return (
    <div className="flex-1 flex-col flex divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={user.image} />
          <AvatarFallback>{user?.username[0]}</AvatarFallback>
        </Avatar>
        <h1 className="font-semibold text-lg">{user.username}</h1>
      </header>
      <ScrollArea className="h-full">
        <MessageItem />
      </ScrollArea>
    </div>
  );
}

function MessageItem() {
  const user = useQuery(api.functions.user.get);

  return (
    <div className="flex items-center px-4 gap-2">
      <Avatar className="size-8 border">
        <AvatarImage src={user!.image} />
        <AvatarFallback>{user!.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">{user!.username}</p>
        <p className="text-sm ">Hello World.</p>
      </div>
      <MessageAction />
    </div>
  );
}

function MessageAction() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="text-red-600">
          <TrashIcon />
          Delete Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
