import {v} from "convex/values";
import {authenticatedMutation, authenticatedQuery} from "./helpers";
import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Get direct message by ID
// Called by: React components via useQuery(api.functions.dm.get, {id})
// Connected to: directMessages and directMessageMembers tables in schema.ts
// Purpose: Fetch a specific direct message conversation by its ID

export const list = authenticatedQuery({
    handler: async (ctx) => {
        const directMessages = await ctx.db
            .query("directMessageMembers")
            .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
            .collect();
        return await Promise.all(
            directMessages.map((dm) => getDirectMessage(ctx, dm.directMessage))
        );
    },
});


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
        return await getDirectMessage(ctx, id);
    }
});


export const create = authenticatedMutation({
    args: {
        username: v.string(),
    },
    handler: async (ctx, { username }) => {
        // Find user by username
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", username))
            .first();
        if (!user) {
            throw new Error("User not found");
        }
        const directMessagesForCurrentUser = await ctx.db
            .query("directMessageMembers")
            .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
            .collect();
        const directMessagesForOtherUser = await ctx.db
            .query("directMessageMembers")
            .withIndex("by_user", (q) => q.eq("user", user._id))
            .collect();
        // Check for existing direct message between the two users
       const directMessage = directMessagesForCurrentUser.find((dm) =>
            directMessagesForOtherUser.find(
                (dm2) => dm2.directMessage === dm2.directMessage
            )
        );
        if (directMessage) {
            return directMessage.directMessage;
        }
        // Create new direct message
        const NewDirectMessage = await ctx.db.insert("directMessages", {});
        await Promise.all([
            ctx.db.insert("directMessageMembers", {
                user: ctx.user._id,
                directMessage: NewDirectMessage,
            }),
            ctx.db.insert("directMessageMembers", {
                user: user._id,
                directMessage: NewDirectMessage,
            }),
        ]);
        return NewDirectMessage;
    },
});

// Helper function to get direct message with other member's user data
const getDirectMessage = async (ctx: QueryCtx & {user: Doc<"users">}, id: Id<"directMessages">) => {

    const dm = await ctx.db.get(id);
    if (!dm) {
        throw new Error("Direct message not found");
    }

    const otherMember = await ctx.db
        .query("directMessageMembers")
        .withIndex("by_direct_message", (q) => q.eq("directMessage", id))
        .filter((q) => q.neq(q.field("user"), ctx.user._id))
        .first();
    if (!otherMember) {
        throw new Error("No other member found in this direct message");
    }
    const user = await ctx.db.get(otherMember.user);
    if (!user) {
        throw new Error("Other member does not exist");
    }
    return { ...dm, user };
};