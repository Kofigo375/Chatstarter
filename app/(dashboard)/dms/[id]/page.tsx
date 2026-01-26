"use client";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQuery } from "convex/react";
import { use, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader,
  MoreVerticalIcon,
  Plus,
  PlusIcon,
  Send,
  SendIcon,
  TrashIcon,
} from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

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
    <div className="flex flex-1 flex-col divide-y h-full overflow-hidden">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={directMessage.user.image} />
          <AvatarFallback>{directMessage.user?.username[0]}</AvatarFallback>
        </Avatar>
        <h1 className="font-semibold text-lg">{directMessage.user.username}</h1>
      </header>
      <ScrollArea className="flex-1">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <TypingIndicator directMessage={id} />
      <MessageInput directMessage={id} />
    </div>
  );
}

function TypingIndicator({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const useernames = useQuery(api.functions.typing.list, { directMessage });

  if (!useernames || useernames.length === 0) {
    return null;
  }
  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      {useernames.join(", ")} is typing...
    </div>
  );
}

type Message = FunctionReturnType<typeof api.functions.message.list>[number];

function MessageItem({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);

  return (
    <div className="flex items-center px-4 gap-2 py-2">
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender?.image} />}
        <AvatarFallback>{message.sender?.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        <p className="text-sm ">{message.content}</p>
        {message.attachment && (
          <Image
            src={message.attachment}
            alt="Attachment"
            width={300}
            height={300}
            className="rounded border overflow-hidden mt-2"
          />
        )}
      </div>
      <MessageAction message={message} />
    </div>
  );
}

function MessageAction({ message }: { message: Message }) {
  const user = useQuery(api.functions.user.get);
  const removeMutation = useMutation(api.functions.message.remove);

  if (!user || message.sender?._id !== user._id) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => removeMutation({ id: message._id })}
        >
          <TrashIcon />
          Delete Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageInput({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.functions.message.create);
  const sendTypingIndicator = useMutation(api.functions.typing.upsert);
  const generateUploadURL = useMutation(
    api.functions.message.generateUploadURL
  );
  const [attachment, setAttachment] = useState<Id<"_storage">>();
  const [file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setFile(file);
    setIsUploading(true);

    try {
      const url = await generateUploadURL();

      const res = await fetch(url, {
        method: "POST",
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
      setAttachment(storageId);
    } catch (error) {
      toast.error("Failed to upload image");
      setFile(undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({ directMessage, attachment, content });
      setContent("");
      setAttachment(undefined);
      setFile(undefined);
    } catch (error) {
      toast.error("Failed to Send Message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className="flex flex-col">
      {file && <ImagePreview file={file} isUploading={isUploading} />}
      <form className="flex items-center p-4 gap-2" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <Button
          type="button"
          size="icon"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon />
          <span className="sr-only">Add Attachment</span>
        </Button>

        <Input
          placeholder="Type your message.."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (content.length > 0) {
              sendTypingIndicator({ directMessage });
            }
          }}
        />
        <Button type="submit" disabled={isUploading}>
          <SendIcon />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

function ImagePreview({
  file,
  isUploading,
}: {
  file: File;
  isUploading: boolean;
}) {
  return (
    <div className="relative px-4 py-2 max-h-40">
      <Image
        src={URL.createObjectURL(file)}
        alt="Attachment Preview"
        width={80}
        height={80}
        className="rounded border overflow-hidden object-cover"
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
          <Loader className="size-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
