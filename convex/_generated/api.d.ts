/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_friends from "../functions/friends.js";
import type * as functions_helpers from "../functions/helpers.js";
import type * as functions_http from "../functions/http.js";
import type * as functions_message from "../functions/message.js";
import type * as functions_user from "../functions/user.js";
import type * as http from "../http.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/friends": typeof functions_friends;
  "functions/helpers": typeof functions_helpers;
  "functions/http": typeof functions_http;
  "functions/message": typeof functions_message;
  "functions/user": typeof functions_user;
  http: typeof http;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
