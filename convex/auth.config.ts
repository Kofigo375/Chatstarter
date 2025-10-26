// Configures Clerk authentication for Convex
// Connects to: Clerk (handles user login/signup) and validates JWT tokens
// Used by: Convex to authenticate users across the app
import {AuthConfig} from "convex/server"

export default {
  providers: [
    {
      // Clerk domain from .env.local (CLERK_JWT_ISSUER_DOMAIN)
      domain: "https://romantic-moose-37.clerk.accounts.dev",
      applicationID: "convex", // JWT template name from Clerk
    },
  ],
} satisfies AuthConfig;
