import { httpRouter } from "convex/server"; // Creates HTTP endpoint router
import { httpAction } from "../_generated/server"; // Defines HTTP handlers
import { Webhook } from "svix"; // Svix library for verifying Clerk webhook signatures
import { WebhookEvent } from "@clerk/nextjs/server"; // TypeScript type for Clerk events

// HTTP router for handling external webhooks and API requests
// Used by: External services (like Clerk) to send data to your app
const http = httpRouter();

// Webhook endpoint for Clerk authentication events
// Listens for: User sign-up, sign-in, profile updates from Clerk
// Path: https://your-app.convex.cloud/clerk-webhook
// Connected to: Clerk Dashboard webhook configuration
http.route({
  method: "POST", // Only accepts POST requests
  path: "/clerk-webhook", // URL path Clerk will call
  handler: httpAction(async (ctx, req) => {
    const body = await validateRequest(req); // Validate webhook request is from Clerk

    // Reject if webhook signature is invalid
    if (!body) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Handle different Clerk events
    // Connected to: Will sync data to users table in schema.ts
    switch (body.type) {
      case "user.created": // When new user signs up
        // TODO: Create user in users table
        break;
      case "user.updated": // When user updates profile
        // TODO: Update user in users table
        break;
      case "user.deleted": // When user deletes account
        // TODO: Delete user from users table
        break;
    }

    return new Response("OK", { status: 200 }); // Tell Clerk webhook received successfully
  }),
});

// Validates webhook requests from Clerk to ensure they're authentic
// Purpose: Prevents fake/malicious requests from pretending to be Clerk
// Used by: Webhook handler above to verify requests before processing
// Returns: Verified webhook data if valid, null if invalid
const validateRequest = async (req: Request) => {
  // Extract Svix security headers from request
  // These headers prove the request came from Clerk (like a digital signature)
  const svix_id = req.headers.get("svix-id"); // Unique message ID
  const svix_timestamp = req.headers.get("svix-timestamp"); // When message was sent
  const svix_signature = req.headers.get("svix-signature"); // Cryptographic signature

  const text = await req.text(); // Get raw request body as text

  try {
    // Create Svix webhook verifier with secret from .env.local
    // CLERK_WEBHOOK_SECRET is provided by Clerk Dashboard
    // The ! tells TypeScript "this env variable definitely exists"
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    // Verify the webhook signature matches the payload
    // Like checking a seal on an envelope to ensure it wasn't tampered with
    // Returns parsed webhook data if valid, throws error if signature doesn't match
    return webhook.verify(text, {
      id: svix_id!, // Message ID from headers
      timestamp: svix_timestamp!, // Timestamp from headers
      signature: svix_signature!, // Signature from headers
    }) as unknown as WebhookEvent; // Cast to Clerk's WebhookEvent type
  } catch (error) {
    // Invalid signature means request is fake or tampered with
    return null; // Reject the webhook
  }
};

// Export router to make endpoints available
// Used by: Convex to register HTTP routes and make them accessible
export default http;
