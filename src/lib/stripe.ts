import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export interface StripeGatewayConfig {
  publishableKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  mode: "test" | "live";
  source: "database" | "environment" | "none";
  isConfigured: boolean;
}

let _cachedConfig: { config: StripeGatewayConfig; expiry: number } | null = null;
let _cachedClient: { client: Stripe; key: string } | null = null;

const CACHE_TTL_MS = 15_000; // 15 seconds cache to balance high performance and instant settings updates

export function invalidateStripeCache() {
  _cachedConfig = null;
  _cachedClient = null;
}

/**
 * Resolves active Stripe credentials from SiteSettings (dashboard configured)
 * with graceful fallback to environment variables.
 */
export async function getStripeConfig(): Promise<StripeGatewayConfig> {
  const now = Date.now();
  if (_cachedConfig && _cachedConfig.expiry > now) {
    return _cachedConfig.config;
  }

  let dbSettings: {
    stripePublishableKey: string | null;
    stripeSecretKey: string | null;
    stripeWebhookSecret: string | null;
    stripeMode: string | null;
  } | null = null;

  try {
    dbSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: {
        stripePublishableKey: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
        stripeMode: true,
      },
    });
  } catch {
    // If DB is offline or table is migrating, fallback to env silently
  }

  const dbSecret = dbSettings?.stripeSecretKey?.trim();
  const dbPub = dbSettings?.stripePublishableKey?.trim();
  const dbWebhook = dbSettings?.stripeWebhookSecret?.trim();
  const dbMode = (dbSettings?.stripeMode === "live" ? "live" : "test") as "test" | "live";

  if (dbSecret) {
    const config: StripeGatewayConfig = {
      publishableKey: dbPub || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
      secretKey: dbSecret,
      webhookSecret: dbWebhook || process.env.STRIPE_WEBHOOK_SECRET || null,
      mode: dbMode,
      source: "database",
      isConfigured: true,
    };
    _cachedConfig = { config, expiry: now + CACHE_TTL_MS };
    return config;
  }

  // Fallback to environment variables
  const envSecret = process.env.STRIPE_SECRET_KEY?.trim();
  const envPub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  const envWebhook = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const isLive = envSecret?.startsWith("sk_live_") ?? false;

  const config: StripeGatewayConfig = {
    publishableKey: envPub || null,
    secretKey: envSecret || null,
    webhookSecret: envWebhook || null,
    mode: isLive ? "live" : "test",
    source: envSecret ? "environment" : "none",
    isConfigured: Boolean(envSecret),
  };

  _cachedConfig = { config, expiry: now + CACHE_TTL_MS };
  return config;
}

/**
 * Returns an authenticated Stripe SDK client instance using the active key.
 */
export async function getStripeClient(): Promise<Stripe> {
  const config = await getStripeConfig();
  const secretKey = config.secretKey || process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Stripe Secret Key is not configured. Please input your Stripe keys in Admin -> Site & Payments or set STRIPE_SECRET_KEY in your environment."
    );
  }

  if (_cachedClient && _cachedClient.key === secretKey) {
    return _cachedClient.client;
  }

  const client = new Stripe(secretKey);
  _cachedClient = { client, key: secretKey };
  return client;
}

/**
 * Returns the active webhook signing secret for Stripe webhook verification.
 */
export async function getStripeWebhookSecret(): Promise<string | null> {
  const config = await getStripeConfig();
  return config.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null;
}

/**
 * Tests connection to Stripe with a given secret key (or active configured key).
 */
export async function testStripeConnection(keyToTest?: string): Promise<{
  ok: boolean;
  mode?: "test" | "live";
  livemode?: boolean;
  error?: string;
  currencies?: string[];
}> {
  try {
    const key = keyToTest?.trim() || (await getStripeConfig()).secretKey || process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return { ok: false, error: "No Stripe Secret Key provided to test." };
    }

    if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_") && !key.startsWith("rk_")) {
      return { ok: false, error: "Invalid Stripe key format. Secret keys must start with sk_test_, sk_live_, or rk_." };
    }

    const testClient = new Stripe(key);
    const balance = await testClient.balance.retrieve();
    const livemode = balance.livemode;
    const currencies = balance.available.map((b) => b.currency.toUpperCase());

    return {
      ok: true,
      mode: livemode ? "live" : "test",
      livemode,
      currencies,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect to Stripe API.";
    return {
      ok: false,
      error: message,
    };
  }
}

/**
 * Backward-compatible Stripe export proxy.
 * Resolves the client dynamically so existing callers continue to work seamlessly.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    // If we have a cached client, use it; otherwise instantiate from env or cached config
    let client = _cachedClient?.client;
    if (!client) {
      const key = _cachedConfig?.config.secretKey || process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error(
          "Stripe is not configured. Please configure Stripe credentials in Admin Settings or set STRIPE_SECRET_KEY."
        );
      }
      client = new Stripe(key);
      _cachedClient = { client, key };
    }
    return Reflect.get(client, prop, client);
  },
});
