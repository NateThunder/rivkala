import "server-only";

import Stripe from "stripe";
import { getShopSecret } from "./cloudflare";

export async function getShopStripe() {
  const secret = await getShopSecret("STRIPE_SECRET_KEY");
  return secret
    ? new Stripe(secret, { httpClient: Stripe.createFetchHttpClient() })
    : null;
}
