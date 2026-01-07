// Friends Management Functions
// Purpose: Handle friend requests and friendships
// Connected to: schema.ts (friends table), helpers.ts (authenticatedQuery)
// Flow: Send request → pending → accept/reject → friendship created/deleted

import { v } from "convex/values"; // ✅ Add missing import
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { authenticatedMutation, authenticatedQuery } from "./helpers";

export const listPending = authenticatedQuery({
  handler: async (ctx) => {
    // Step 1: Get all pending friend requests where current user is user2
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "pending")
      )
      .collect();

    // Step 2: For each friend request, fetch the sender's user data
    const results = await Promise.allSettled(
      friends.map(async (friend) => {
        const user = await ctx.db.get(friend.user1);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          ...friend,
          user,
        };
      })
    );

    // Step 3: Filter out failed requests and return successful ones
    return results
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
  },
});

export const listAccepted = authenticatedQuery({
  handler: async (ctx) => {
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1_status", (q) =>
        q.eq("user1", ctx.user._id).eq("status", "accepted")
      )
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2_status", (q) =>
        q.eq("user2", ctx.user._id).eq("status", "accepted")
      )
      .collect();

    const friendsWithUsers1 = await mapWithUsers(ctx, friends1, "user2");
    const friendsWithUsers2 = await mapWithUsers(ctx, friends2, "user1");

    return [...friendsWithUsers1, ...friendsWithUsers2];
  },
});

export const createFriendRequest = authenticatedMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) {
      throw new Error("User not found");
    } else if (user._id === ctx.user._id) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check if friendship already exists (either direction)
    const existingFriend = await ctx.db
      .query("friends")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("user1"), ctx.user._id),
            q.eq(q.field("user2"), user._id)
          ),
          q.and(
            q.eq(q.field("user1"), user._id),
            q.eq(q.field("user2"), ctx.user._id)
          )
        )
      )
      .first();

    if (existingFriend) {
      throw new Error("Friend request already exists");
    }

    await ctx.db.insert("friends", {
      user1: ctx.user._id,
      user2: user._id,
      status: "pending" as const, // ✅ Fixed with 'as const'
    });
  },
});

export const updateStatus = authenticatedMutation({
  args: {
    id: v.id("friends"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const friend = await ctx.db.get(args.id);

    if (!friend) {
      throw new Error("Friend request not found");
    }

    // Only user2 (recipient) can accept/reject
    if (friend.user2 !== ctx.user._id) {
      throw new Error("Unauthorized - only recipient can respond");
    }

    await ctx.db.patch(args.id, {
      status: args.status as any, // 
    });
  },
});

const mapWithUsers = async <
  K extends string,
  T extends { [Key in K]: Id<"users"> },
>(
  ctx: QueryCtx,
  items: T[],
  key: K
) => {
  const results = await Promise.allSettled(
    items.map(async (item) => {
      const user = await ctx.db.get(item[key]);
      if (!user) {
        throw new Error("User not found");
      }
      return {
        ...item,
        user,
      };
    })
  );

  // Step 3: Filter out failed requests and return successful ones
  return results
    .filter((res) => res.status === "fulfilled")
    .map((res) => res.value);
};
