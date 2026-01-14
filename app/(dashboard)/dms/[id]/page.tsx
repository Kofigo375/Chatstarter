"use client";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { use, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, Send, SendIcon, TrashIcon } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Page component for individual direct message thread
// Used in: app/(dashboard)/dms/[id]/page.tsx

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<"directMessages"> }>;
}) {
  const { id } = use(params);

  const directMessage = useQuery(api.functions.dm.get, { id });
  const messages = useQuery(api.functions.message.list, { directMessage: id });

  if (!directMessage) {
    return null; // Or a loading state
  }

  return (
    <div className="flex-1 flex-col flex divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={directMessage.user.image} />
          <AvatarFallback>{directMessage.user?.username[0]}</AvatarFallback>
        </Avatar>
        <h1 className="font-semibold text-lg">{directMessage.user.username}</h1>
      </header>
      <ScrollArea className="h-full">
        {messages?.map((message) => (<MessageItem key={message._id} message={message} />))}
      </ScrollArea>
      <MessageInput directMessageId={id} />
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];

function MessageItem({message}: {message: Message}) {
  const user = useQuery(api.functions.user.get);

  return (
    <div className="flex items-center px-4 gap-2">
      <Avatar className="size-8 border">
        {message.sender &&<AvatarImage src={message.sender?.image} />}
        <AvatarFallback>{message.sender?.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">{message.sender?.username ?? "Deleted User"}</p>
        <p className="text-sm ">{message.content}</p>
      </div>
      <MessageAction message={message} />
    </div>
  );
}

function MessageAction({message}: {message: Message}) {

  const user = useQuery(api.functions.user.get);
  if (!user || message.sender?._id !== user._id)  {
    return null;
  }

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

function MessageInput({ directMessageId }: { directMessageId: Id<"directMessages"> }) {
  const [content, setContent] = useState("");
  


  return (
    <div className="flex items-center p-4 gap-2">
      <Input placeholder="Type your message.." value={content} onChange={(e) => setContent(e.target.value)} />
      <Button>
        <SendIcon />
        <span className="sr-only">Send </span>
      </Button>
    </div>
  );
}
