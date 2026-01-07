// Add Friend Dialog Component
// Purpose: Modal popup to add friends by username
// Connected to: page.tsx (Friends page header button)
// Flow: Click button → Dialog opens → Enter username → Send request

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Form label component
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";




export function AddFriend() {
  const [open, setOpen] = useState(false); // Dialog open state
  const createFriendRequest = useMutation(api.functions.friends.createRequest);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createFriendRequest({ username: e.currentTarget.username.value });
      toast.success("Friend request sent!");
      setOpen(false); // Close dialog on success

  } catch (error) {
      toast.error("Error sending friend request:", 
        { description: (error instanceof Error? error.message : "An unknown error occurred") });
    }

  };




  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Friend</Button> 
      </DialogTrigger>

      <DialogContent>
        {" "}
        {/* Modal popup content */}
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            You can add friends by their username.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          {" "}
          {/* Form for friend request */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label> {/* ✅ Now works */}
            <Input type="text" id="username" placeholder="Enter username" />
          </div>
          <DialogFooter>
            <Button type="submit">Send Friend Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
