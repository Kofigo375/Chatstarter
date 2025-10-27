// HTTP Routes Configuration
// Purpose: Handles external HTTP requests to your Convex backend
// Main use: Receives webhooks from Clerk when users sign up/login/update profiles
// Flow: Clerk → This endpoint → Validates request → Updates users table (via user.ts)


import { httpRouter } from "convex/server"; // Creates HTTP endpoint router
import { httpAction } from "./_generated/server"; // Defines HTTP handlers
import { Webhook } from "svix"; // Svix library for verifying Clerk webhook signatures
import { WebhookEvent } from "@clerk/nextjs/server"; // TypeScript type for Clerk events
import { internal } from "./_generated/api"; // Internal API to call Convex functions (gives access to user.ts functions)


// HTTP router for handling external webhooks and API requests
// Used by: External services (like Clerk) to send data to your app
const http = httpRouter();


// Webhook endpoint for Clerk authentication events
// Listens for: User sign-up, sign-in, profile updates from Clerk
// Path: https://your-convex-url.convex.cloud/clerk-webhook
// Connected to: Clerk Dashboard webhook configuration
// Required: CLERK_WEBHOOK_SECRET in .env.local for security
http.route({
 method: "POST", // Only accepts POST requests (webhooks are always POST)
 path: "/clerk-webhook", // URL path Clerk will call
 handler: httpAction(async (ctx, req) => {
   const body = await validateRequest(req); // Validate webhook request is from Clerk


   // Reject if webhook signature is invalid (prevents fake requests)
   if (!body) {
     return new Response("Unauthorized", { status: 401 });
   }


   // Handle different Clerk events
   // Connected to: Calls user.ts functions to sync data to users table in schema.ts
   switch (body.type) {
     case "user.created": // When new user signs up
       // Call upsert mutation from user.ts to create user in database
       await ctx.runMutation(internal.functions.user.upsert, {
         username: body.data.username!, // ! asserts this exists
         image: body.data.image_url, // Profile picture URL from Clerk
         clerkId: body.data.id, // Unique Clerk user ID
       });
       break;
     case "user.updated": // When user updates profile
       // Call upsert mutation from user.ts to update existing user
       await ctx.runMutation(internal.functions.user.upsert, {
         username: body.data.username!,
         image: body.data.image_url,
         clerkId: body.data.id,
       });
       break;
     case "user.deleted": // When user deletes account
       if (body.data.id) {
         // Only delete if we have a valid ID
         // Call remove mutation from user.ts to delete user from database
         await ctx.runMutation(internal.functions.user.remove, {
           clerkId: body.data.id,
         });
       }
       break;
   }


   return new Response("OK", { status: 200 }); // Tell Clerk webhook received successfully
 }),
});


// Validates webhook requests from Clerk to ensure they're authentic
// Purpose: Prevents fake/malicious requests from pretending to be Clerk
// Security: Uses cryptographic signatures (HMAC) to verify request origin
// Used by: Webhook handler above to verify requests before processing
// Returns: Verified webhook data if valid, null if invalid/tampered
const validateRequest = async (req: Request) => {
 // Extract Svix security headers from request
 // These headers prove the request came from Clerk (like a digital signature)
 const svix_id = req.headers.get("svix-id"); // Unique message ID
 const svix_timestamp = req.headers.get("svix-timestamp"); // When message was sent (prevents replay attacks)
 const svix_signature = req.headers.get("svix-signature"); // Cryptographic signature


 const text = await req.text(); // Get raw request body as text (needed for verification)


 try {
   // Create Svix webhook verifier with secret from .env.local
   // CLERK_WEBHOOK_SECRET is provided by Clerk Dashboard → Webhooks section
   // The ! tells TypeScript "this env variable definitely exists"
   const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);


   // Verify the webhook signature matches the payload
   // Like checking a seal on an envelope to ensure it wasn't tampered with
   // Returns parsed webhook data if valid, throws error if signature doesn't match
   return webhook.verify(text, {
     "svix-id": svix_id!, // Message ID from headers
     "svix-timestamp": svix_timestamp!, // Timestamp from headers
     "svix-signature": svix_signature!, // Signature from headers
   }) as unknown as WebhookEvent; // Cast to Clerk's WebhookEvent type for TypeScript
 } catch (error) {
   // Invalid signature means request is fake or tampered with
   console.error("Webhook validation failed:", error); // Log for debugging
   return null; // Reject the webhook (returns null to handler)
 }
};


// Export router to make endpoints available
// Used by: Convex to register HTTP routes and make them accessible at /clerk-webhook
export default http;


