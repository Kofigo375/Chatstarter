// User Management Functions
// Purpose: Sync user data from Clerk to Convex database
// Connected to: http.ts (called by Clerk webhooks), schema.ts (users table)
// Flow: Clerk webhook → http.ts → This function → users table in database

import {
  internalMutation, // Function type: only callable from backend (security)
  MutationCtx, // TypeScript type for mutation context
  query, // Function type: callable from client to fetch data
  QueryCtx, // TypeScript type for query context
} from "../_generated/server"; // Auto-generated server types from Convex
import { v } from "convex/values";

// Get current authenticated user
// Called by: React components via useQuery(api.functions.user.get)
// Connected to: Clerk authentication (gets user identity from auth token)
// Returns: Current user's data from database or null if not authenticated
// Used in: Components that need to display current user info (profile, settings, etc.)
export const getCurrentUser = async (ctx: QueryCtx) => {
  // ✅ Use Clerk's built-in method (not convex-dev/auth)
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  // identity.subject is the Clerk user ID
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
};

// This is the public query that uses getCurrentUser
export const get = query({
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Upsert (Update or Insert) user in database
// Called by: http.ts when Clerk sends user.created or user.updated webhooks
// Purpose: Keep Convex users table in sync with Clerk authentication
// Pattern: If user exists → update, if not → create new
// Security: internalMutation = only backend can call (client cannot access)
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
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)) // Use index for fast search by Clerk ID
      .unique(); // Get single result (or null if not found)

    // If user exists, update their info (handles user.updated webhook)
    if (user) {
      await ctx.db.patch(user._id, {
        // Update existing user record by ID
        username: args.username, // Update username (in case they changed it in Clerk)
        image: args.image, // Update profile image (in case they changed it in Clerk)
        clerkId: args.clerkId, // Clerk ID stays the same (immutable identifier)
      });
    } else {
      // If user doesn't exist, create new user (handles user.created webhook)
      await ctx.db.insert("users", {
        // Insert new user record into users table
        username: args.username,
        image: args.image,
        clerkId: args.clerkId,
      });
    }
  },
});

// Delete user from database
// Called by: http.ts when Clerk sends user.deleted webhook
// Purpose: Remove user data when they delete their account in Clerk
// Connected to: Ensures users table stays in sync with Clerk authentication
// Security: internalMutation = only backend can call
export const remove = internalMutation({
  args: { clerkId: v.string() }, // Only need Clerk ID to identify user to delete

  handler: async (ctx, args) => {
    // Find the user to delete using helper function
    const user = await getUserByClerkId(ctx, args.clerkId);

    if (user) {
      await ctx.db.delete(user._id); // Remove user record permanently from database
      // TODO: Consider deleting related data (messages, DMs, etc.) for data cleanup
    }
  },
});

// Helper function: Find user in database by Clerk ID
// Used by: getCurrentUser (line 78), remove mutation (line 70)
// Purpose: Reusable query logic to find user by Clerk ID
// Returns: User object or null if not found
const getUserByClerkId = async (
  ctx: QueryCtx | MutationCtx, // Context from query or mutation
  clerkId: string // Clerk user ID to search for
) => {
  return await ctx.db
    .query("users") // Query users table from schema.ts
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId)) // Use index for fast lookup
    .unique(); // Return single user or null
};
