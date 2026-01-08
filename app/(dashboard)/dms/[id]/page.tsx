"use client";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { use } from "react";

// Page component for individual direct message thread
// Used in: app/(dashboard)/dms/[id]/page.tsx

export default function MessagePage({ 
    params,
 }: { params: Promise<{ id: string }> }) {
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
            <MessageItem />
        </div>
    );
}


function MessageItem() {

    const user = useQuery(api.functions.user.get);

    return <div className="flex items-center px-4 gap-2">
        <Avatar className="size-8 border"> 
            <AvatarImage src={user!.image} />
            <AvatarFallback>{user!.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">{user!.username}</p>
            <p className="text-sm ">Hello World.</p>
        </div>
    </div>;
}