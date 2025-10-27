// User Management Functions
// Purpose: Sync user data from Clerk to Convex database
// Connected to: http.ts (called by Clerk webhooks), schema.ts (users table)
// Flow: Clerk webhook → http.ts → This function → users table in database

import { internalMutation } from "../_generated/server"; // Internal mutations (only callable from backend, not from client)
import { v } from "convex/values"; // Validator for type checking arguments

// Upsert (Update or Insert) user in database
// Called by: http.ts when Clerk sends user.created or user.updated webhooks
// Purpose: Keep Convex users table in sync with Clerk authentication
// Pattern: If user exists → update, if not → create new
export const upsert = internalMutation({
  // Required arguments from Clerk webhook
  args: {
    username: v.string(), // User's display name from Clerk
    image: v.string(), // Profile picture URL from Clerk
    clerkId: v.string(), // Unique Clerk user ID (used to identify user)
  },

  handler: async (ctx, args) => {
    // Check if user already exists in database
    // Uses "by_clerk_id" index from schema.ts for fast lookup
    const user = await ctx.db
      .query("users") // Query users table from schema.ts
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)) // Find by Clerk ID using index
      .unique(); // Get single result (or null if not found)

    // If user exists, update their info (for user.updated webhook)
    if (user) {
      await ctx.db.patch(user._id, {
        // Update existing user record
        username: args.username, // Update username (in case they changed it)
        image: args.image, // Update profile image (in case they changed it)
        clerkId: args.clerkId, // Clerk ID stays the same (immutable)
      });
    } else {
      // If user doesn't exist, create new user (for user.created webhook)
      await ctx.db.insert("users", {
        // Insert new user record
        username: args.username,
        image: args.image,
        clerkId: args.clerkId,
      });
    }
  },
});

// Delete user from database
// Called by: http.ts when Clerk sends user.deleted webhook
// Purpose: Remove user data when they delete their account
// Connected to: Ensures users table stays in sync with Clerk
export const remove = internalMutation({
  args: { clerkId: v.string() }, // Only need Clerk ID to identify user to delete

  handler: async (ctx, args) => {
    // Find the user to delete
    // Uses "by_clerk_id" index from schema.ts for fast lookup
    const user = await ctx.db
      .query("users") // Query users table
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)) // Find by Clerk ID
      .unique(); // Get single result (or null if not found)

    // If user exists, delete them from database
    if (user) {
      await ctx.db.delete(user._id); // Remove user record permanently
      // TODO: Consider deleting related data (messages, etc.) if needed
    }
  },
});
