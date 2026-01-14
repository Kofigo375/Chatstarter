// Database Schema
// Purpose: Define all tables and their structure
// Connected to: All convex functions that query/mutate data
// Tables: users (profiles), friends (relationships), messages (chat)

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { use } from "react";

export default defineSchema({
  // Users table - stores registered user information
  // Connected to: Clerk authentication, user profiles
  users: defineTable({
    username: v.string(), // User's display name
    image: v.string(), // Profile picture URL
    clerkId: v.string(), // Unique ID from Clerk auth service
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"]), // Fast lookups by Clerk ID

  // Friends table - tracks friendship relationships between users
  // Connected to: Friend requests, friends list display
  // Flow: User1 sends request → status: pending → User2 accepts → status: accepted
  friends: defineTable({
    user1: v.id("users"), // Reference to one user (who sent request)
    user2: v.id("users"), // Reference to other user (who receives request)
    status: v.union(
      v.literal("pending"), // Friend request sent, awaiting response
      v.literal("accepted"), // Both users are friends
      v.literal("rejected") // Friend request was declined
    ), // ✅ Closing parenthesis for v.union()
  })
    .index("by_user1", ["user1"]) // Index for fast queries: "Find all friends of user1"
    .index("by_user2", ["user2"]) // Index for user2 lookups
    .index("by_user1_status", ["user1", "status"]) // ✅ Add this
    .index("by_user2_status", ["user2", "status"]), // ✅ Add this

  // Messages table - stores all chat messages
  // Connected to: convex/functions/message.ts (list and create functions)
  directMessages: defineTable({}),
  directMessageMembers: defineTable({
    directMessage: v.id("directMessages"),
    user: v.id("users"),
  })
    .index("by_direct_message", ["directMessage"])
    .index("by_directMessage_user", ["directMessage", "user"])
    .index("by_user", ["user"]),

  messages: defineTable({
    sender: v.id("users"), // Who sent it (will link to users table later)
    content: v.string(), // The message text
    directMessage: v.id("directMessages"), // Which DM this message belongs to
  }).index("by_directMessage", ["directMessage"]),
});
