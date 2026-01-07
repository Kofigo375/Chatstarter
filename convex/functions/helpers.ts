// Helper Functions
// Purpose: Reusable utilities for Convex functions
// Connected to: All authenticated queries/mutations

import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "./user";

// Authenticated Query Wrapper
// Purpose: Automatically check if user is logged in before running query
// Returns: Query builder with user context pre-loaded
// Usage: Replace query() with authenticatedQuery() in your functions
export const authenticatedQuery = customQuery(
  query, //
  customCtx(async (ctx) => {
    //
    const user = await getCurrentUser(ctx); // Get current logged-in user
    if (!user) {
      throw new Error("Unauthorized"); // Reject if not logged in
    }
    return { user }; // Add user to context (available as ctx.user)
  })
);

// Authenticated Mutation Wrapper
// Purpose: Automatically check if user is logged in before running mutation
// Returns: Mutation builder with user context pre-loaded
// Usage: Replace mutation() with authenticatedMutation() in your functions
export const authenticatedMutation = customMutation(
  mutation, //
  customCtx(async (ctx) => {
    //
    const user = await getCurrentUser(ctx); // Get current logged-in user
    if (!user) {
      throw new Error("Unauthorized"); // Reject if not logged in
    }
    return { user }; // Add user to context (available as ctx.user)
  })
);
