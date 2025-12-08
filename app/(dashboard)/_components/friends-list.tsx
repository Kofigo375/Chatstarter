// Friends List Component
// Purpose: Display list of friends and pending friend requests
// Connected to: page.tsx (Friends page), user.ts (fetches user data)
// Flow: Fetches current user → Creates test array → Renders friend items

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api"; // Auto-generated API from Convex
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useQuery } from "convex/react"; // Hook to fetch real-time data
import { CheckIcon, MessageCircleCodeIcon, X, XIcon } from "lucide-react";

// Hook to get test users (temporary - for development)
// TODO: Replace with actual friends query when friend system is implemented
const useTestUsers = () => {
  const user = useQuery(api.functions.user.get); // Fetches current authenticated user

  if (!user) {
    return []; // Return empty array while loading
  }

  return [user, user, user, user, user]; // Array of 5 users for testing UI
};

// Component to display pending friend requests
// Used in: page.tsx (Friends page)
export function PendingFriendsList() {
  const users = useTestUsers(); // Call custom hook to get user array

  return (
    <div className="flex flex-col divide-y">
      {" "}
      {/* Stack items vertically with dividers */}
      <h2 className="text-sm text-muted-foreground">Pending Friends</h2>
      {users.map(
        (
          user,
          index // Loop through users array
        ) => (
          <FriendItem
            key={index} // Unique key for React list rendering
            username={user.username} // Pass username as prop
            image={user.image} // Pass image URL as prop
          >
            <Button size="icon" variant="ghost">
              {" "}
              {/* Accept button */}
              <CheckIcon className="text-green-600" /> {/* ✅ Green icon */}
              <span className="sr-only">Accept</span>{" "}
              {/* Hidden text for screen readers */}
            </Button>
            <Button size="icon" variant="ghost">
              {" "}
              {/* Reject button */}
              <XIcon className="text-red-600" /> {/* ✅ Red icon */}
              <span className="sr-only">Reject</span>{" "}
              {/* Hidden text for screen readers */}
            </Button>
          </FriendItem>
        )
      )}
    </div>
  );
}

export function AcceptedFriendsList() {
  const users = useTestUsers(); // Call custom hook to get user array

  return (
    <div className="flex flex-col divide-y">
      {" "}
      {/* Stack items vertically with dividers */}
      <h2 className="text-sm text-muted-foreground">Accepted Friends</h2>
      {users.map(
        (
          user,
          index // Loop through users array
        ) => (
          <FriendItem
            key={index} // Unique key for React list rendering
            username={user.username} // Pass username as prop
            image={user.image} // Pass image URL as prop
          >
            
           <IconButton
           title="Start DM"
            icon={<MessageCircleCodeIcon className="text-blue-600" />}
           /> 

          <IconButton
            title="Remove Friend"
            icon={<XIcon className="text-red-600" />}
          />
          </FriendItem>
        )
      )}{" "}
      {/* ✅ Added closing brace */}
    </div>
  );
}


function IconButton({
  title,
  classname,
  icon
}: {
  title: string;
  classname?: string;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" className={classname}>
          {icon}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent> {title} </TooltipContent>
    </Tooltip> 
  )

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
