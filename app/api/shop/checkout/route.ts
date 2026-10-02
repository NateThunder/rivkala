import type Stripe from "stripe";
import { encodeCheckoutLine, resolveCheckoutLine, validCheckoutLine } from "@/lib/shop/checkout-items";
import { getShopSecret } from "@/lib/shop/cloudflare";
import { getShopStripe } from "@/lib/shop/stripe";
import type { ShopCheckoutLine } from "@/lib/shop/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { lines?: ShopCheckoutLine[] } | null;
  if (!body?.lines?.length || body.lines.length > 30) {
    return Response.json({ error: "The cart is invalid." }, { status: 400 });
  }
  if (body.lines.some((line) => !validCheckoutLine(line))) {
    return Response.json({ error: "The cart quantities are invalid." }, { status: 400 });
  }

  const stripe = await getShopStripe();
  if (!stripe) {
    return Response.json({ error: "Stripe Checkout is not configured yet." }, { status: 503 });
  }

  const resolved = await Promise.all(
    body.lines.map(async (line) => ({ line, item: await resolveCheckoutLine(line) }))
  );
  if (resolved.some(({ item }) => !item)) {
    return Response.json({ error: "A product in your cart is no longer available." }, { status: 409 });
  }
  for (const { line, item } of resolved) {
    if (!item) continue;
    if (item.variant.stock !== null && item.variant.stock < line.quantity) {
      return Response.json({ error: `${item.product.name} does not have enough stock.` }, { status: 409 });
    }
  }

  const hasPhysical = resolved.some(({ item }) => item?.product.kind === "physical");
  const subtotal = resolved.reduce(
    (total, { line, item }) => total + (item?.variant.priceGBP ?? 0) * line.quantity,
    0
  );
  const metadata = Object.fromEntries(
    body.lines.map((line, index) => [`line_${index}`, encodeCheckoutLine(line)])
  );
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolved.map(({ line, item }) => ({
    quantity: line.quantity,
    price_data: {
      currency: "gbp",
      unit_amount: item!.variant.priceGBP,
      tax_behavior: "exclusive",
      product_data: {
        name: item!.product.name,
        description: item!.variant.name,
        metadata: {
          product_id: item!.product.id,
          variant_id: item!.variant.id,
          kind: item!.product.kind,
        },
      },
    },
  }));
  const origin = (await getShopSecret("NEXT_PUBLIC_SITE_URL")) || new URL(request.url).origin;
  const shippingAmount = subtotal >= 5000 ? 0 : 400;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    adaptive_pricing: { enabled: true },
    line_items: lineItems,
    customer_creation: "always",
    billing_address_collection: "auto",
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    shipping_address_collection: hasPhysical ? { allowed_countries: ["GB"] } : undefined,
    shipping_options: hasPhysical
      ? [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: shippingAmount === 0 ? "Free UK delivery" : "UK standard delivery",
              fixed_amount: { amount: shippingAmount, currency: "gbp" },
              tax_behavior: "exclusive",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 3 },
                maximum: { unit: "business_day", value: 7 },
              },
            },
          },
        ]
      : undefined,
    metadata,
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${body.lines.every((line) => line.musicId) ? "music" : "shop/cart"}`,
  });

  return Response.json({ url: session.url });
}
