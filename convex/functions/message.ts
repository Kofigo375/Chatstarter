import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authenticatedMutation, authenticatedQuery } from "./helpers";

// QUERY: Fetch all messages from database
// Used by: React components to display chat messages (via useQuery hook)
// Returns: Array of all messages in real-time
export const list = authenticatedQuery({
  args: {
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { directMessage }) => {
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_directMessage_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this direct message");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_directMessage", (q) =>
        q.eq("directMessage", directMessage)
      )
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.sender);
        return {
          ...message,
          sender,
        };
      })
    );
  },
});

// MUTATION: Add a new message to database
// Used by: React form submission when user sends a message (via useMutation hook)
// Args: sender (who sent it), content (the message text)
// Connects to: schema.ts (messages table structure)
export const create = authenticatedMutation({
  args: {
    content: v.string(),
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { content, directMessage }) => {
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_directMessage_user", (q) =>
        q.eq("directMessage", directMessage).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this direct message");
    }

    await ctx.db.insert("messages", {
      content,
      directMessage,
      sender: ctx.user._id,
    });
  },
});
