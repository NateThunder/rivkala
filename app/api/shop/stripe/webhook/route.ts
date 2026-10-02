import { getShopSecret } from "@/lib/shop/cloudflare";
import { recordPaidShopOrder } from "@/lib/shop/orders";
import { getShopStripe } from "@/lib/shop/stripe";

export async function POST(request: Request) {
  const stripe = await getShopStripe();
  const secret = await getShopSecret("STRIPE_WEBHOOK_SECRET");
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) {
    return Response.json({ error: "The shop webhook is not configured." }, { status: 400 });
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
    if (
      (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
      event.data.object.payment_status === "paid"
    ) {
      await recordPaidShopOrder(event.data.object);
    }
    return Response.json({ received: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid webhook." },
      { status: 400 }
    );
  }
}
