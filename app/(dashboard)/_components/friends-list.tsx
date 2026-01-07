// Friends List Component
// Purpose: Display list of friends and pending friend requests
// Connected to: page.tsx (Friends page), user.ts (fetches user data)
// Flow: Fetches current user → Creates test array → Renders friend items

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { useMutation, useQuery } from "convex/react";
import { CheckIcon, MessageCircleCodeIcon, XIcon } from "lucide-react";
import { use } from "react";

// Hook to get test users (temporary - for development)
// TODO: Replace with actual friends query when friend system is implemented
const useTestUsers = () => {
  const user = useQuery(api.functions.user.get); // Fetches current authenticated user

  if (!user) {
    return []; // Array of 5 users for testing UI
  }

  return [user, user, user, user]; // Return empty array while loading
};

// Component to display pending friend requests
// Used in: page.tsx (Friends page)
export function PendingFriendsList() {
  const friends = useQuery(api.functions.friends.listPending);
  const updateStatus = useMutation(api.functions.friends.updateStatus); // ✅ Add this line

  // ✅ Add this check BEFORE using .map()
  if (!friends) {
    return (
      <div className="flex flex-col divide-y">
        <h2 className="text-sm text-muted-foreground">Pending Friends</h2>
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-sm text-muted-foreground">Pending Friends</h2>

      {friends.length === 0 && (
        <FriendsListEmpty>No pending friend requests.</FriendsListEmpty>
      )}

      {friends.map((friend, index) => (
        <FriendItem
          key={index}
          username={friend.user.username}
          image={friend.user.image}
        >
          <IconButton
            title="Accept"
            icon={<CheckIcon className="text-green-600" />}
            onClick={() => updateStatus({ id: friend._id, status: "accepted" })} // ✅ Add this
          />
          <IconButton
            title="Reject"
            icon={<XIcon className="text-red-600" />}
            onClick={() => updateStatus({ id: friend._id, status: "rejected" })} // ✅ Add this
          />
        </FriendItem>
      ))}
    </div>
  );
}

export function AcceptedFriendsList() {
  const friends = useQuery(api.functions.friends.listAccepted);

  // ✅ Add this check BEFORE using .map()
  if (!friends) {
    return (
      <div className="flex flex-col divide-y">
        <h2 className="text-sm text-muted-foreground">Accepted Friends</h2>
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-sm text-muted-foreground">Accepted Friends</h2>

      {friends.length === 0 && (
        <FriendsListEmpty>No friends yet.</FriendsListEmpty>
      )}

      {friends.map(
        (
          friend,
          index // ✅ Now safe
        ) => (
          <FriendItem
            key={index}
            username={friend.user.username}
            image={friend.user.image}
          >
            <IconButton title="Start DM" icon={<MessageCircleCodeIcon />} />
            <IconButton
              title="Remove Friend"
              icon={<XIcon className="text-red-600" />}
            />
          </FriendItem>
        )
      )}
    </div>
  );
}

function FriendsListEmpty({ children }: { children?: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground rounded-md">
      {children}
    </div>
  );
}

function IconButton({
  title,
  classname,
  icon,
  onClick,
}: {
  title: string;
  classname?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className={classname}
          onClick={onClick}
        >
          {icon}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent> {title} </TooltipContent>
    </Tooltip>
  );
}

// Individual friend item component
// Props: username (string), image (string), children (optional buttons)
function FriendItem({
  username,
  image,
  children,
}: {
  username: string;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 p-2 justify-between">
      {" "}
      {/* Added justify-between */}
      <div className="flex items-center gap-2">
        {" "}
        {/* Wrap avatar + username together */}
        <Avatar className="size-6">
          {" "}
          {/* 24px square avatar */}
          <AvatarImage src={image} /> {/* Try to load image from URL */}
          <AvatarFallback>{username[0]}</AvatarFallback>{" "}
          {/* Fallback: first letter */}
        </Avatar>
        <p className="text-sm font-medium">{username}</p>{" "}
        {/* Display username */}
      </div>
      <div className="flex items-center gap-1">
        {" "}
        {/*  Wrap buttons together */}
        {children} {/* Buttons render here */}
      </div>
    </div>
  );
}
