type EmailLine = {
  name: string;
  quantity: number;
  price: number;
  options?: Record<string, string>;
  personalization?: string;
};

export type EmailOrder = {
  orderNumber: string;
  email: string;
  items: EmailLine[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  shippingAddress?: string;
};

export type EmailResult =
  | { ok: true; skipped: false }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character
  );
}

function lineLabel(line: EmailLine) {
  const options = Object.entries(line.options ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
  return [options, line.personalization ? `Personalization: ${line.personalization}` : ""]
    .filter(Boolean)
    .join(" — ");
}

/**
 * Sends a customer receipt through Resend when RESEND_API_KEY and
 * ORDER_FROM_EMAIL are configured. No-ops otherwise so the shop can launch
 * with Stripe receipts and add Resend later.
 */
export async function sendOrderConfirmation(order: EmailOrder): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      reason: "RESEND_API_KEY / ORDER_FROM_EMAIL are not configured",
    };
  }
  if (!order.email) {
    return { ok: false, skipped: true, reason: "Order has no customer email" };
  }

  const rows = order.items
    .map((line) => {
      const detail = lineLabel(line);
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #e7e2d8;">
            <div style="font-weight:600;color:#0a0a0a;">${escapeHtml(line.name)}</div>
            ${detail ? `<div style="margin-top:4px;color:#77736a;font-size:12px;">${escapeHtml(detail)}</div>` : ""}
            <div style="margin-top:4px;color:#77736a;font-size:12px;">Qty ${line.quantity}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #e7e2d8;text-align:right;white-space:nowrap;color:#0a0a0a;">
            ${money(line.price * line.quantity)}
          </td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="background:#f7f5f0;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;">
        <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#77736a;">Black Lab Spots</div>
        <h1 style="margin:18px 0 8px;font-size:30px;line-height:1.1;">Good dog. Good order.</h1>
        <p style="margin:0 0 24px;color:#57534b;font-size:14px;line-height:1.6;">
          Thanks for your order. Spot is supervising production. We’ll follow up with tracking as soon as it ships.
        </p>
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#77736a;">Order ${escapeHtml(order.orderNumber)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
          <tr><td style="padding:4px 0;color:#77736a;">Subtotal</td><td style="padding:4px 0;text-align:right;">${money(order.subtotal)}</td></tr>
          <tr><td style="padding:4px 0;color:#77736a;">Shipping</td><td style="padding:4px 0;text-align:right;">${order.shipping ? money(order.shipping) : "Free"}</td></tr>
          ${order.discount ? `<tr><td style="padding:4px 0;color:#77736a;">Discount</td><td style="padding:4px 0;text-align:right;">−${money(order.discount)}</td></tr>` : ""}
          <tr><td style="padding:10px 0 0;font-weight:700;">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:700;">${money(order.total)}</td></tr>
        </table>
        ${
          order.shippingAddress
            ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e7e2d8;color:#77736a;font-size:12px;line-height:1.6;"><strong style="color:#0a0a0a;">Shipping to</strong><br />${escapeHtml(order.shippingAddress)}</div>`
            : ""
        }
        <p style="margin:28px 0 0;color:#77736a;font-size:12px;line-height:1.6;">
          Personalized pieces are final sale. Questions? DM
          <a href="https://instagram.com/lucasvandeweerd" style="color:#0a0a0a;">@lucasvandeweerd</a>
          on Instagram and we’ll help.
        </p>
      </div>
    </div>`;

  const text = [
    "Black Lab Spots — order confirmed",
    `Order ${order.orderNumber}`,
    "",
    ...order.items.flatMap((line) => [
      `${line.quantity}× ${line.name} — ${money(line.price * line.quantity)}`,
      lineLabel(line) ? `  ${lineLabel(line)}` : "",
    ]),
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${order.shipping ? money(order.shipping) : "Free"}`,
    ...(order.discount ? [`Discount: −${money(order.discount)}`] : []),
    `Total: ${money(order.total)}`,
    order.shippingAddress ? `\nShipping to:\n${order.shippingAddress}` : "",
    "",
    "Personalized pieces are final sale. Questions? DM @lucasvandeweerd on Instagram.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: `Order confirmed — ${order.orderNumber}`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const raw = await response.text();
    let data: { id?: string; message?: string } = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // Keep the raw response in the error message.
    }
    if (!response.ok || !data.id) {
      return {
        ok: false,
        skipped: false,
        reason: `Resend ${response.status}: ${data.message ?? raw.slice(0, 200)}`,
      };
    }
    return { ok: true, skipped: false };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Unknown Resend error",
    };
  }
}
