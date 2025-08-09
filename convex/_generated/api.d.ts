/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crops from "../crops.js";
import type * as marketplace from "../marketplace.js";
import type * as plantHealth from "../plantHealth.js";
import type * as recommendations from "../recommendations.js";
<<<<<<< Updated upstream
=======
import type * as users from "../users.js";
>>>>>>> Stashed changes

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crops: typeof crops;
  marketplace: typeof marketplace;
  plantHealth: typeof plantHealth;
  recommendations: typeof recommendations;
<<<<<<< Updated upstream
=======
  users: typeof users;
>>>>>>> Stashed changes
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
