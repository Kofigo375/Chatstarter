import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// QUERY: Fetch all messages from database
// Used by: React components to display chat messages (via useQuery hook)
// Returns: Array of all messages in real-time
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").collect();
  },
});

// MUTATION: Add a new message to database
// Used by: React form submission when user sends a message (via useMutation hook)
// Args: sender (who sent it), content (the message text)
// Connects to: schema.ts (messages table structure)
export const create = mutation({
  args: {
    sender: v.string(), // Validates sender is a string
    content: v.string(), // Validates content is a string
  },
  handler: async (ctx, { sender, content }) => {
    await ctx.db.insert("messages", { sender, content });
  },
});
