import { getShopEmail } from "@/lib/shop/cloudflare";
import { after } from "next/server";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const kitSubscriptionUrl = "https://app.kit.com/forms/9480546/subscriptions";

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function subscribeToKit(name: string, emailAddress: string) {
  try {
    const subscription = await fetch(kitSubscriptionUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "fields[first_name]": name,
        email_address: emailAddress,
      }),
    });
    if (!subscription.ok) {
      console.error("Kit contact subscription failed", subscription.status);
    }
  } catch (subscriptionError) {
    console.error("Kit contact subscription failed", subscriptionError);
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return error("Invalid form submission.", 415);
  }

  const form = await request.formData();
  if (clean(form.get("company"), 200)) return Response.json({ ok: true });

  const name = clean(form.get("name"), 100);
  const emailAddress = clean(form.get("email"), 254).toLowerCase();
  const subject = clean(form.get("subject"), 160);
  const message = clean(form.get("message"), 5000);
  const mailingListOptOut = form.get("mailingListOptOut") === "on";

  if (!name || !emailPattern.test(emailAddress) || message.length < 10) {
    return error("Please check your name, email, and message.", 400);
  }
  const email = await getShopEmail();
  if (!email) return error("Email delivery is unavailable right now.", 503);

  const emailSubject = subject ? `[Rivkala contact] ${subject}` : `[Rivkala contact] Message from ${name}`;
  const text = [`Name: ${name}`, `Email: ${emailAddress}`, `Subject: ${subject || "(none)"}`, "", message].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#211b17"><h1>New website enquiry</h1><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> <a href="mailto:${escapeHtml(emailAddress)}">${escapeHtml(emailAddress)}</a></p><p><strong>Subject:</strong> ${escapeHtml(subject || "(none)")}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p></div>`;

  try {
    await email.send({
      to: ["rivkala.music@gmail.com", "n.somevi@hotmail.com"],
      from: { email: "downloads@rivkala.com", name: "Rivkala Website" },
      replyTo: { email: emailAddress, name },
      subject: emailSubject,
      text,
      html,
    });

    if (!mailingListOptOut) after(() => subscribeToKit(name, emailAddress));

    return Response.json({ ok: true });
  } catch (sendError) {
    console.error("Contact email failed", sendError);
    return error("Your message could not be sent. Please email rivkala.music@gmail.com directly.", 502);
  }
}
