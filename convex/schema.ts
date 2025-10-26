import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    content: v.string(),  // The message text
    sender: v.string(),   // Who sent it
  }),
});
