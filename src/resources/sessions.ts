import type { HttpClient } from "../http.js";
import type { Session } from "../types.js";

export class SessionsResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<Session[]> {
    return this.http.get<Session[]>("/api/v1/sessions");
  }
}
