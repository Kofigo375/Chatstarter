"use client";

import { api } from "@/convex/_generated/api";
import { Avatar } from "@radix-ui/react-avatar";
import { useQuery } from "convex/react";
import { use } from "react";

// Page component for individual direct message thread
// Used in: app/(dashboard)/dms/[id]/page.tsx

export default function MessagePage({ 
    params,
 }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const user = useQuery(api.functions.user.get);


    return (
        <div className="flex-1 flex-col flex divide-y max-h-screen">
            <header className="flex items-center gap-2 p-4">
                <Avatar></Avatar>
            </header>
        </div>
    );
}