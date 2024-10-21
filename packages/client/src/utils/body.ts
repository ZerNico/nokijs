export function inferContentType(body: unknown): string | undefined {
  if (!body) {
    return undefined;
  }

  if (typeof body === "string") {
    return "text/plain";
  }

  if (typeof body === "object") {
    return "application/json";
  }

  return "application/octet-stream";
}

export function encodeBody(
  body: unknown,
  contentType?: string,
): string | undefined {
  if (!body) {
    return undefined;
  }

  if (contentType === "application/json") {
    return JSON.stringify(body);
  }

  if (contentType === "text/plain") {
    return body as string;
  }

  return "";
}

export async function parseResponseBody(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  const isJSON = contentType?.includes("application/json");

  if (isJSON) {
    return response.json();
  }

  return response.text();
}
