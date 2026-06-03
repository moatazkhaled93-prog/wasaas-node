import { WasaasAPIError } from "./errors.js";

export class HttpClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return this.#handleResponse<T>(res);
  }

  async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return this.#handleResponse<T>(res);
  }

  async #handleResponse<T>(res: Response): Promise<T> {
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new WasaasAPIError(
        res.status,
        (data.error as string) ?? `HTTP ${res.status}`,
        data.detail as string | undefined,
      );
    }
    return data as T;
  }
}
