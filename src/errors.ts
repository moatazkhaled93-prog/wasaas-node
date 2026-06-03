export class WasaasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WasaasError";
  }
}

export class WasaasAPIError extends WasaasError {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "WasaasAPIError";
    this.status = status;
    this.detail = detail;
  }
}
