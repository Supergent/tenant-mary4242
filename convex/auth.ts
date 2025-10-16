import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { type DataModel } from "./_generated/dataModel";

/**
 * Better Auth client for Convex
 * Used to interact with authentication from Convex functions
 */
export const authComponent = createClient<DataModel>(components.betterAuth as any);

/**
 * Create Better Auth instance
 * Called from HTTP routes and authentication endpoints
 */
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL!,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        // JWT expires after 30 days
        jwtExpirationSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  });
};