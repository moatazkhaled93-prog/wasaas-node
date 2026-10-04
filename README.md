# wasaas

Official Node.js SDK for the [Wasaas WhatsApp API](https://wasaas.org).

Send WhatsApp messages, receive webhooks, and check numbers — all from a clean, typed interface.

## Install

```bash
npm install wasaas
# or
pnpm add wasaas
# or
yarn add wasaas
```

**Requires Node.js 18+** (uses native `fetch`).

## Quick start

```typescript
import { Wasaas } from "wasaas";

const client = new Wasaas({ apiKey: process.env.WASAAS_API_KEY! });

// List connected WhatsApp sessions
const sessions = await client.sessions.list();
const sessionId = sessions[0].session_id;

// Send a text message
await client.messages.sendText({
  sessionId,
  to: "966501234567",
  message: "Hello from Wasaas! 👋",
});
```

Get your API key at [wasaas.org](https://wasaas.org) — plans start at $29/month with a 7-day money-back guarantee.

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

## Usage with webhooks

Configure an incoming webhook in the [Wasaas dashboard](https://wasaas.org/customer/dashboard). Your endpoint receives a POST for every incoming message:

```typescript
app.post("/whatsapp-hook", express.json(), (req, res) => {
  const { event, data } = req.body;

  if (event === "message.received") {
    console.log(`From ${data.from}: ${data.message}`);
    // trigger your reply logic here
  }

  res.sendStatus(200);
});
```

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
