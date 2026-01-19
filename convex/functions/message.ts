import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internal } from "../_generated/api";

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
        const attachment = message.attachment
          ? await ctx.storage.getUrl(message.attachment)
          : undefined;
        return {
          ...message,
          sender,
          attachment 
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
    attachment: v.optional(v.id("_storage")),
    directMessage: v.id("directMessages"),
  },
  handler: async (ctx, { content, directMessage, attachment }) => {
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
      attachment,
      directMessage,
      sender: ctx.user._id,
    });
    await ctx.scheduler.runAfter(0, internal.functions.typing.remove, {
      directMessage,
      user: ctx.user._id,
    });

  },
});

export const remove = authenticatedMutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error("Message not found");
    } else if (message.sender !== ctx.user._id) {
      throw new Error("You are not the sender of this message");
    }
    await ctx.db.delete(id);
    if (message.attachment) {
      await ctx.storage.delete(message.attachment);
    }
  },
});


export const generateUploadURL = authenticatedMutation({
  handler: async (ctx) => { 
    return await ctx.storage.generateUploadUrl();
  },
});
