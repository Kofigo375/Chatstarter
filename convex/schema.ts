import { defineSchema, defineTable } from "convex/server"; // Functions to define database structure
import { v } from "convex/values"; // Validator object for type checking

// Defines entire database structure for Discord clone
// Used by: Convex to create tables and enforce data types
// Connected to: convex/functions/ files that query/mutate this data
export default defineSchema({
  // Users table - stores registered user information
  // Connected to: Clerk authentication, user profiles
  users: defineTable({
    username: v.string(), // User's display name
    image: v.string(), // Profile picture URL
    clerkId: v.string(), // Unique ID from Clerk auth service
  }).index("by_clerk_id", ["clerkId"]), // Fast lookups by Clerk ID for authentication

  // Messages table - stores all chat messages
  // Connected to: convex/functions/message.ts (list and create functions)
  // Used by: app/page.tsx to display and send messages
  messages: defineTable({
    content: v.string(), // The message text
    sender: v.string(), // Who sent it (will link to users table later)
  }),
});
