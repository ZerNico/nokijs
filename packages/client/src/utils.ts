import type { TypedResponse } from "./types";

export function detectRequestContentType(body: unknown) {
  if (typeof body === "object" || typeof body === "boolean" || body === null) {
    return "application/json";
  }

  return "text/plain";
}

const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

function detectResponseContentType(contentType: string) {
  const splitContentType = contentType.split(";").shift() || "";

  if (splitContentType.length === 0) {
    return "text";
  }

  if (JSON_RE.test(splitContentType)) {
    return "json";
  }

  return "text";
}

async function parseResponseBody(response: Response) {
  const contentType = detectResponseContentType(response.headers.get("content-type") || "");

  if (contentType === "json") {
    return await response.json();
  }

  return await response.text();
}

export async function buildTypedResponse<TBody extends string | Record<string, any>>(
  response: Response,
): Promise<TypedResponse<TBody>> {
  const data = (await parseResponseBody(response)) as TBody;
  return {
    data,
    response,
    status: response.status,
    headers: response.headers,
  };
}
