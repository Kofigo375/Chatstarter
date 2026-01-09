import {v} from "convex/values";
import {authenticatedQuery} from "./helpers";

// Get direct message by ID
// Called by: React components via useQuery(api.functions.dm.get, {id})
// Connected to: directMessages and directMessageMembers tables in schema.ts
// Purpose: Fetch a specific direct message conversation by its ID

export const get = authenticatedQuery({
    args: {
        id: v.id("directMessages"),
    },
    handler: async (ctx, { id }) => {
        const member = await ctx.db
            .query("directMessageMembers")
            .withIndex("by_directMessage_user", (q) =>
                q.eq("directMessage", id).eq("user", ctx.user._id)
            )
            .first();
            
        if (!member) {
            throw new Error("You are not a member of this direct message");
        }
        const dm = await ctx.db.get(id);
        const otherMembers = await ctx.db
            .query("directMessageMembers")
            .withIndex("by_direct_message", (q) => q.eq("directMessage", id))
            .filter((q) => q.neq(q.field("user"), ctx.user._id))
            .first();
    },
});
