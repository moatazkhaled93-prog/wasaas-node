import type { HttpClient } from "../http.js";
import type { ValidateNumberParams, ValidateNumberResponse } from "../types.js";

export class NumbersResource {
  constructor(private readonly http: HttpClient) {}

  validate(params: ValidateNumberParams): Promise<ValidateNumberResponse> {
    return this.http.post<ValidateNumberResponse>("/api/v1/check-number", {
      session_id: params.sessionId,
      phone: params.phone,
    });
  }
}
