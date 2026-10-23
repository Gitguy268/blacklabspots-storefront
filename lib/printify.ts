type OrderLine = {
  productId: string;
  variantId: number;
  quantity: number;
  personalization?: string;
};

type Address = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
};

export type PrintifyResult =
  | { ok: true; orderId: string; sentToProduction: boolean }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

function config() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shopId) return null;
  return { token, shopId };
}

export function printifyConfigured() {
  return Boolean(config());
}

async function printifyFetch(token: string, path: string, init: RequestInit) {
  return fetch(`https://api.printify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "BlackLabSpots/1.0 (https://blacklabspotsshop.me)",
      ...(init.headers ?? {}),
    },
  });
}

/**
 * Creates a Printify order. Orders are created as drafts unless
 * PRINTIFY_SEND_TO_PRODUCTION=true, which lets the shop review personalized
 * jobs before they hit the press.
 */
export async function createPrintifyOrder({
  externalId,
  lines,
  address,
}: {
  externalId: string;
  lines: OrderLine[];
  address: Address;
}): Promise<PrintifyResult> {
  const settings = config();
  if (!settings) {
    return {
      ok: false,
      skipped: true,
      reason: "PRINTIFY_API_TOKEN / PRINTIFY_SHOP_ID are not configured",
    };
  }

  if (!lines.length) {
    return { ok: false, skipped: false, reason: "No line items" };
  }

  const body = {
    external_id: externalId,
    label: externalId.slice(-14).toUpperCase(),
    line_items: lines.map((line, index) => ({
      product_id: line.productId,
      variant_id: line.variantId,
      quantity: line.quantity,
      external_id: `${externalId}-${index + 1}`,
      ...(line.personalization
        ? {
            personalisation: {
              personalisation_strategy: "manual",
              personalisation_instructions: line.personalization,
            },
          }
        : {}),
    })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: address.firstName,
      last_name: address.lastName,
      email: address.email,
      phone: address.phone ?? "",
      country: address.country,
      region: address.region ?? "",
      address1: address.address1,
      address2: address.address2 ?? "",
      city: address.city,
      zip: address.postalCode,
    },
  };

  try {
    const response = await printifyFetch(
      settings.token,
      `/shops/${settings.shopId}/orders.json`,
      { method: "POST", body: JSON.stringify(body) }
    );

    const text = await response.text();
    let data: { id?: string; message?: string; errors?: unknown } = {};
    try {
      data = JSON.parse(text);
    } catch {
      // Keep the raw text in the error below.
    }

    if (!response.ok || !data.id) {
      return {
        ok: false,
        skipped: false,
        reason: `Printify ${response.status}: ${data.message ?? text.slice(0, 300)}`,
      };
    }

    let sentToProduction = false;
    if (process.env.PRINTIFY_SEND_TO_PRODUCTION === "true") {
      const send = await printifyFetch(
        settings.token,
        `/shops/${settings.shopId}/orders/${data.id}/send_to_production.json`,
        { method: "POST" }
      );
      sentToProduction = send.ok;
      if (!send.ok) {
        console.error(
          `[printify] order ${data.id} created but could not be sent to production: ${send.status}`
        );
      }
    }

    return { ok: true, orderId: data.id, sentToProduction };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Unknown Printify error",
    };
  }
}
