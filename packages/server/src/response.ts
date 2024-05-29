import type { ResponseTypes } from "./types";
import { type CookieOptions, serializeCookie } from "./utils/cookie";
import { joinHeaders } from "./utils/headers";

export class ResponseBuilder {
  public headers = new Headers();
  public status = 200;
  public statusText?: string;

  public setCookie(name: string, value: string, opts?: CookieOptions) {
    const cookie = serializeCookie(name, value, opts);
    this.headers.append("set-cookie", cookie);
  }

  public deleteCookie(name: string) {
    this.setCookie(name, "", { maxAge: -1 });
  }

  public text(text: string, opts?: ResponseInit) {
    return new TypedResponse(text, this.generateOpts("text/plain", opts));
  }

  public json<TBody extends Record<string, any>>(body: TBody, opts?: ResponseInit) {
    return new TypedResponse(body, this.generateOpts("application/json", opts));
  }

  private generateOpts(contentType: string, opts?: ResponseInit): ResponseInit {
    const headers = joinHeaders(this.headers, opts?.headers);

    if (!headers.has("content-type")) {
      headers.set("content-type", contentType);
    }

    return { status: this.status, statusText: this.statusText, ...opts, headers: headers };
  }
}

export class TypedResponse<TBody extends ResponseTypes> extends Response {
  constructor(body: TBody, opts?: ResponseInit) {
    super(typeof body === "string" ? body : JSON.stringify(body), opts);
  }
}
