import type { ResponseTypes } from "./types";

export class ResponseBuilder {
  public headers: Record<string, string> = {};
  public status = 200;
  public statusText?: string;

  public text(text: string, opts?: ResponseInit) {
    return new TypedResponse(text, this.generateOpts("text/plain", opts));
  }

  public json<TBody extends Record<string, any>>(body: TBody, opts?: ResponseInit) {
    return new TypedResponse(body, this.generateOpts("application/json", opts));
  }

  private generateOpts(contentType: string, opts?: ResponseInit): ResponseInit {
    const headers = new Headers(opts?.headers);

    for (const [key, value] of Object.entries({ "content-type": contentType, ...this.headers })) {
      if (headers.has(key)) continue;
      headers.set(key, value);
    }

    return { status: this.status, statusText: this.statusText, ...opts, headers: headers };
  }
}

export class TypedResponse<TBody extends ResponseTypes> extends Response {
  constructor(body: TBody, opts?: ResponseInit) {
    super(typeof body === "string" ? body : JSON.stringify(body), opts);
  }
}
