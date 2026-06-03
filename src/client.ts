import { HttpClient } from "./http.js";
import { MessagesResource } from "./resources/messages.js";
import { NumbersResource } from "./resources/numbers.js";
import { SessionsResource } from "./resources/sessions.js";
import type { WasaasClientOptions } from "./types.js";

const DEFAULT_BASE_URL = "https://wasaas.org";

export class Wasaas {
  readonly messages: MessagesResource;
  readonly sessions: SessionsResource;
  readonly numbers: NumbersResource;

  constructor(options: WasaasClientOptions) {
    if (!options.apiKey) {
      throw new Error("Wasaas: apiKey is required");
    }
    if (!options.apiKey.startsWith("wsa_")) {
      throw new Error("Wasaas: apiKey must start with 'wsa_'");
    }

    const http = new HttpClient(
      options.apiKey,
      options.baseUrl ?? DEFAULT_BASE_URL,
    );

    this.messages = new MessagesResource(http);
    this.sessions = new SessionsResource(http);
    this.numbers = new NumbersResource(http);
  }
}
