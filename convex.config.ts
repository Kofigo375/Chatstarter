// convex.config.ts (root)
import { defineApp } from "convex/server";
import http from "./convex/http.js";   // <-- note the .js
const app = defineApp();
app.use(http);
export default app;