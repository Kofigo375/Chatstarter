// convex/functions/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "../_generated/server";

const http = httpRouter();

http.route({
  method: "POST",
  path: "/clerk-webhook",
  handler: httpAction(async (_ctx, _req) => {
    console.log("✅ hit /clerk-webhook (test mode)");
    return new Response("OK", { status: 200 });
  }),
});

export default http;