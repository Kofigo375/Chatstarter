import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function NewDirectMessage() {

  const [open, setOpen] = useState(false); // Dialog open state
  const createFriendRequest = useMutation(
    api.functions.friends.createFriendRequest
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const username = e.currentTarget.username.value;
      await createFriendRequest({ username });
      toast.success("Friend request sent!");
      setOpen(false); // Close dialog on success
    } catch (error) {
      toast.error("Error sending friend request:", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className="sr-only">New Direct Message</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Start a new direct message by entering a username.
          </DialogDescription>
        </DialogHeader>
        <form className="contents">
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input type="text" id="username" placeholder="Enter username" />
          </div>
          <DialogFooter>
            <Button type="submit">Start Direct Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
