import type { HttpClient } from "../http.js";
import type {
  SendDocumentParams,
  SendImageParams,
  SendMessageResponse,
  SendTextParams,
} from "../types.js";

export class MessagesResource {
  constructor(private readonly http: HttpClient) {}

  sendText(params: SendTextParams): Promise<SendMessageResponse> {
    return this.http.post<SendMessageResponse>("/api/v1/messages", {
      session_id: params.sessionId,
      to: params.to,
      message: params.message,
    });
  }

  sendImage(params: SendImageParams): Promise<SendMessageResponse> {
    return this.http.post<SendMessageResponse>("/api/v1/messages/image", {
      session_id: params.sessionId,
      to: params.to,
      image_url: params.imageUrl,
      ...(params.caption !== undefined && { caption: params.caption }),
    });
  }

  sendDocument(params: SendDocumentParams): Promise<SendMessageResponse> {
    return this.http.post<SendMessageResponse>("/api/v1/messages/document", {
      session_id: params.sessionId,
      to: params.to,
      base64: params.base64,
      filename: params.filename,
      mime: params.mime,
      ...(params.caption !== undefined && { caption: params.caption }),
    });
  }
}
