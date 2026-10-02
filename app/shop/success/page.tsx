import Link from "next/link";
import { getShopOrderDownloads, recordPaidShopOrder } from "@/lib/shop/orders";
import { getShopStripe } from "@/lib/shop/stripe";
import { ClearShopCart } from "./clear-cart";
import styles from "../shop.module.css";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const stripe = await getShopStripe();
  const session = stripe && session_id?.startsWith("cs_")
    ? await stripe.checkout.sessions.retrieve(session_id).catch(() => null)
    : null;
  if (session?.payment_status === "paid") await recordPaidShopOrder(session).catch(() => null);
  const downloads = session?.payment_status === "paid" && session_id
    ? await getShopOrderDownloads(session_id)
    : [];
  const isMusicPurchase = Object.values(session?.metadata ?? {}).some((value) => value.startsWith("music:"));
  return (
    <section className={styles.successPage}>
      {session?.payment_status === "paid" && !isMusicPurchase ? <ClearShopCart /> : null}
      <p className={styles.kicker}>Order confirmed</p>
      <h1>Thank you,<br />darling.</h1>
      <p>{session?.customer_details?.email ? `Stripe has sent your receipt to ${session.customer_details.email}.` : "Your payment has been received."}</p>
      {downloads.length ? (
        <div className={styles.downloadList}>
          <h2>Your downloads</h2>
          {downloads.map((item) => <a className={styles.primaryButton} href={`/api/shop/downloads/${item.token}`} key={item.token}>Download {item.product_name} ({item.format.toUpperCase()})</a>)}
          <small>All available formats have also been emailed. Links expire after 24 hours and permit five downloads each.</small>
        </div>
      ) : null}
      <Link className={styles.primaryButton} href={isMusicPurchase ? "/music" : "/shop"}>Return to {isMusicPurchase ? "the music" : "the shop"}</Link>
    </section>
  );
}
