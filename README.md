# wasaas

Official Node.js SDK for the [Wasaas WhatsApp API](https://wasaas.org).

Send WhatsApp messages, receive real signed webhooks, and check numbers — all from a clean, typed interface. No Meta Business account or app review required: connect a regular WhatsApp number via QR code.

Full endpoint reference (auth, fields, error codes): [wasaas.org/docs](https://wasaas.org/docs?utm_source=github&utm_medium=readme&utm_campaign=wasaas-node).

## Quickstart (5 minutes)

**1. Install**

```bash
npm install wasaas
# or
pnpm add wasaas
# or
yarn add wasaas
```

**Requires Node.js 18+** (uses native `fetch`).

**2. Auth** — create an API key

Sign up at [wasaas.org](https://wasaas.org/register?utm_source=github&utm_medium=readme&utm_campaign=wasaas-node) — [7-day free trial, no card required](https://wasaas.org?ref=github-wasaas-node). Then go to **API Keys → Create API Key** in the dashboard. Keys look like `wsa_...` and are shown only once. See [pricing](https://wasaas.org/pricing) for plan limits.

```bash
export WASAAS_API_KEY=wsa_your_api_key
```

**3. Connect** — link a WhatsApp number

```typescript
import { Wasaas } from "wasaas";

const client = new Wasaas({ apiKey: process.env.WASAAS_API_KEY! });

// List connected WhatsApp sessions
const sessions = await client.sessions.list();
const sessionId = sessions[0].session_id;
```

If this returns an empty array, go to **Sessions → Add Session** in the dashboard and scan the QR code with the WhatsApp number you want to send/receive from.

## Your first message

```typescript
const result = await client.messages.sendText({
  sessionId,
  to: "966501234567", // digits only, with country code
  message: "Hello from Wasaas! 👋",
});
// { success: true, to: "966501234567", status: "sent" }
```

---

## API reference

### `new Wasaas(options)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your `wsa_` API key from the dashboard |
| `baseUrl` | `string` | No | Override the base URL (default: `https://wasaas.org`) |

---

### `client.sessions`

#### `sessions.list()`

Returns all WhatsApp sessions connected to your account.

```typescript
const sessions = await client.sessions.list();

// [
//   {
//     id: "clxyz...",
//     session_id: "my-session-1",
//     phone: "966501234567",
//     status: "connected",
//     created_at: "2026-06-01T10:00:00.000Z"
//   }
// ]
```

**Session statuses:** `connected` · `authenticated` · `qr_ready` · `initializing` · `disconnected` · `not_started`

---

### `client.messages`

#### `messages.sendText(params)`

Send a plain text message.

```typescript
const result = await client.messages.sendText({
  sessionId: "my-session-1",
  to: "966501234567",       // E.164 format, no '+' prefix
  message: "Your order #1234 has shipped! 🚚",
});
// { success: true, to: "966501234567", status: "sent" }
```

| Param | Type | Required |
|-------|------|----------|
| `sessionId` | `string` | Yes |
| `to` | `string` | Yes |
| `message` | `string` | Yes |

---

#### `messages.sendImage(params)`

Send an image by URL with an optional caption.

```typescript
await client.messages.sendImage({
  sessionId: "my-session-1",
  to: "966501234567",
  imageUrl: "https://example.com/invoice-thumb.png",
  caption: "Invoice #1234 — due 15 Jun",   // optional
});
```

| Param | Type | Required |
|-------|------|----------|
| `sessionId` | `string` | Yes |
| `to` | `string` | Yes |
| `imageUrl` | `string` | Yes |
| `caption` | `string` | No |

---

#### `messages.sendDocument(params)`

Send a document (PDF, Word, Excel, etc.) as a base64-encoded string.

```typescript
import { readFileSync } from "fs";

const base64 = readFileSync("./invoice.pdf").toString("base64");

await client.messages.sendDocument({
  sessionId: "my-session-1",
  to: "966501234567",
  base64,
  filename: "invoice-1234.pdf",
  mime: "application/pdf",
  caption: "Your invoice is attached",    // optional
});
```

| Param | Type | Required |
|-------|------|----------|
| `sessionId` | `string` | Yes |
| `to` | `string` | Yes |
| `base64` | `string` | Yes |
| `filename` | `string` | Yes |
| `mime` | `string` | Yes |
| `caption` | `string` | No |

---

### `client.numbers`

#### `numbers.validate(params)`

Check whether a phone number has an active WhatsApp account.

```typescript
const result = await client.numbers.validate({
  sessionId: "my-session-1",
  phone: "966501234567",
});
// { exists: true, phone: "966501234567" }
// { exists: false }
```

| Param | Type | Required |
|-------|------|----------|
| `sessionId` | `string` | Yes |
| `phone` | `string` | Yes |

---

## Error handling

All methods throw a `WasaasAPIError` on non-2xx responses.

```typescript
import { Wasaas, WasaasAPIError } from "wasaas";

const client = new Wasaas({ apiKey: process.env.WASAAS_API_KEY! });

try {
  await client.messages.sendText({
    sessionId: "my-session-1",
    to: "966501234567",
    message: "Hello!",
  });
} catch (err) {
  if (err instanceof WasaasAPIError) {
    console.error(err.status);   // 401 | 404 | 429 | 500 …
    console.error(err.message);  // "Invalid API key" | "Session not found" …
    console.error(err.detail);   // optional extra detail from the server
  }
}
```

**Common status codes:**

| Status | Meaning |
|--------|---------|
| `401` | Invalid or revoked API key |
| `400` | Invalid request body |
| `404` | Session not found |
| `429` | Message or API call quota exceeded — upgrade your plan |
| `500` | WhatsApp session error |

---

## Usage with Express

```typescript
import express from "express";
import { Wasaas } from "wasaas";

const app = express();
const client = new Wasaas({ apiKey: process.env.WASAAS_API_KEY! });

app.post("/notify-order", express.json(), async (req, res) => {
  const { phone, orderId } = req.body;

  await client.messages.sendText({
    sessionId: process.env.WASAAS_SESSION_ID!,
    to: phone,
    message: `Order #${orderId} confirmed! We'll notify you when it ships.`,
  });

  res.json({ ok: true });
});
```

## Webhooks

Outbound webhook delivery shipped and is live in production. Register an HTTPS endpoint in the [Wasaas dashboard](https://wasaas.org/customer/webhooks) under **Customer → Webhooks**, and Wasaas signs and POSTs you an event for `message.received`, `message.status` (a send finished), or `session.status_changed`. The signing secret is shown once, at creation time.

Every delivery carries an envelope and an `X-Wasaas-Signature: t=<unix_timestamp>,v1=<hex_hmac>` header. Verify it with the **raw** request body (not the re-serialized JSON) before trusting the payload:

```typescript
import crypto from "crypto";
import express from "express";

function verifyWasaasSignature(
  secret: string,
  rawBody: string,
  header: string,
  toleranceSeconds = 300,
): boolean {
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=")));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(parts.v1 || "", "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const app = express();

app.post(
  "/wasaas-webhook",
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString("utf8");
    },
  }),
  (req, res) => {
    const signature = req.header("x-wasaas-signature") ?? "";
    if (!verifyWasaasSignature(process.env.WASAAS_WEBHOOK_SECRET!, (req as any).rawBody, signature)) {
      return res.sendStatus(401);
    }

    const { id, type, data } = req.body; // id is the idempotency key — dedupe retries on it

    if (type === "message.received") {
      console.log("Inbound message:", data); // see docs for the per-event data shape
      // trigger your reply logic here
    }

    res.sendStatus(200); // must be 2xx within 8s, or Wasaas retries up to 5x
  },
);
```

Full envelope shape, retry/backoff timing, and the `endpoint.verification` handshake sent when you first register a URL are documented at [wasaas.org/docs#webhooks](https://wasaas.org/docs?utm_source=github&utm_medium=readme&utm_campaign=wasaas-node#webhooks).

---

## Get started

**[Free 7-day trial, no card required →](https://wasaas.org?ref=github-wasaas-node)**

Full docs: **[wasaas.org/docs](https://wasaas.org/docs?utm_source=github&utm_medium=readme&utm_campaign=wasaas-node)**

---

## CommonJS

The package ships both ESM and CJS builds. CommonJS works without any configuration:

```javascript
const { Wasaas } = require("wasaas");
const client = new Wasaas({ apiKey: process.env.WASAAS_API_KEY });
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

Made with ❤️ by [Wasaas](https://wasaas.org)
