import { type CookieOptions, serializeCookie } from "./utils/cookies";
import { joinHeaders } from "./utils/headers";

export class ResponseBuilder {
  public headers: Headers = new Headers();

  public json<
    TBody extends JsonResponseBody,
    const TStatus extends number = 200,
  >(
    body: TBody,
    opts?: ResponseOptions<TStatus>,
  ): TypedResponse<TBody, TStatus> {
    const headers = joinHeaders(
      { "content-type": "application/json" },
      this.headers,
      opts?.headers,
    );

    return new TypedResponse(body, { ...opts, headers });
  }

  public text<const TBody extends string, const TStatus extends number = 200>(
    body: TBody,
    opts?: ResponseOptions<TStatus>,
  ): TypedResponse<TBody, TStatus> {
    const headers = joinHeaders(
      { "content-type": "text/plain" },
      this.headers,
      opts?.headers,
    );

    return new TypedResponse(body, { ...opts, headers });
  }

  public setCookie(
    name: string,
    value: string,
    opts?: CookieOptions,
  ): void {
    const cookie = serializeCookie(name, value, opts);

    this.headers.append("set-cookie", cookie);
  }

  public deleteCookie(name: string, opts?: CookieOptions): void {
    const cookie = serializeCookie(name, "", {
      ...opts,
      expires: new Date(0),
    });

    this.headers.append("set-cookie", cookie);
  }
}

export class TypedResponse<
  TBody extends ResponseBody = string,
  TStatus extends number = 200,
> {
  public status: TStatus;
  public headers: Headers;
  public body: TBody;

  constructor(body: TBody, opts?: ResponseOptions<TStatus>) {
    this.body = body;
    this.headers = new Headers(opts?.headers);
    this.status = opts?.status ?? (200 as TStatus);
  }

  public toResponse(): Response {
    const body =
      typeof this.body === "object"
        ? JSON.stringify(this.body)
        : (this.body as string);

    return new Response(body, {
      status: this.status,
      headers: this.headers,
    });
  }
}

interface ResponseOptions<TStatus extends number = 200> {
  status?: TStatus;
  headers?: HeadersInit;
  statusText?: string;
}

type JsonResponseBody = Record<string, any> | boolean | number | string | null;
type ResponseBody = string | JsonResponseBody;
