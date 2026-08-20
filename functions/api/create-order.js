/**
 * POST /api/create-order  — Cloudflare Pages Function
 *
 * Creates a Razorpay order server-side so the secret key never reaches the
 * browser, then returns the order JSON ({ id, amount, currency, ... }) to the
 * registration page (assets/js/ith-register.js), which opens Razorpay Checkout
 * with the returned order_id.
 *
 * Required environment variables (set in Cloudflare Pages → Settings →
 * Environment variables, for Production and Preview):
 *   RAZORPAY_KEY_ID      — your Razorpay key id (starts with rzp_live_ or rzp_test_)
 *   RAZORPAY_KEY_SECRET  — your Razorpay key secret (KEEP SECRET; never in client code)
 *
 * This is a Pages Function, so it adds ONLY the /api/create-order route — the
 * rest of the static site is served normally. Do not also ship a root
 * `_worker.js`; the two mechanisms are mutually exclusive on Pages.
 */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Strip characters Razorpay notes won't accept (emoji / non-ASCII) and cap length.
const clean = (str, max = 200) => {
  if (str === undefined || str === null) return "N/A";
  const s = String(str).replace(/[^\x20-\x7E]/g, "").trim();
  return (s || "N/A").slice(0, max);
};

export async function onRequestPost({ request, env }) {
  try {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return json({ error: "Payments are not configured yet. Please try again shortly." }, 503);
    }

    const body = await request.json().catch(() => ({}));

    // Validate the amount server-side — never trust the client blindly.
    const rupees = Number(body.amountToPay);
    if (!Number.isFinite(rupees) || rupees < 1 || rupees > 500000) {
      return json({ error: "Invalid amount." }, 400);
    }
    const amountInPaise = Math.round(rupees * 100);

    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: "rcpt_" + Math.random().toString(36).slice(2, 12),
        notes: {
          Type: clean(body.mode, 20),
          Name: clean(body.name, 80),
          Email: clean(body.email, 120),
          Phone: clean(body.phone, 20),
          Grade: clean(body.grade, 30),
          School: clean(body.schoolName, 120),
          Address: clean(body.schoolAddress, 120),
          Coordinator: clean(body.teacherName, 80),
          CoordinatorPhone: clean(body.teacherPhone, 20),
          CoordinatorEmail: clean(body.teacherEmail, 120),
          Cart: clean(body.cartSummary, 200),
        },
      }),
    });

    const order = await rzpRes.json();
    if (!rzpRes.ok || order.error) {
      const msg = order && order.error ? order.error.description : "Order creation failed.";
      return json({ error: `Razorpay: ${msg}` }, 400);
    }

    return json(order, 200);
  } catch (err) {
    return json({ error: "Server error while creating the order.", details: String(err && err.message || err) }, 500);
  }
}

// Anything other than POST on this route:
export async function onRequest({ request }) {
  if (request.method === "POST") return; // handled by onRequestPost
  return json({ error: "Method not allowed" }, 405);
}
