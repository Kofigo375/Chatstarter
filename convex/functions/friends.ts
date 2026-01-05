// Friends Management Functions
// Purpose: Handle friend requests and friendships
// Connected to: schema.ts (friends table), helpers.ts (authenticatedQuery)
// Flow: Send request → pending → accept/reject → friendship created/deleted

import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import { authenticatedQuery } from "./helpers"; // ✅ Add this import

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






const mapWithUsers = async <
    K extends string,
    T extends { [Key in K]: Id<"users">  }
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
}