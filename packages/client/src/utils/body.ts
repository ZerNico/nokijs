export function inferContentType(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return undefined; // Let the browser set the content-type with boundary
  }

  if (hasFileField(body)) {
    return undefined; // Will be converted to FormData
  }

  if (typeof body === "object") {
    return "application/json";
  }

  return "text/plain";
}

export function encodeBody(
  body: unknown,
  contentType?: string
): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (hasFileField(body)) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }
    return formData;
  }

  if (contentType === "application/json") {
    return JSON.stringify(body);
  }

  return String(body);
}

function hasFileField(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }

  return Object.values(body as Record<string, unknown>).some(
    (value) => value instanceof File
  );
}

export async function parseResponseBody(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  const isJSON = contentType?.includes("application/json");

  if (isJSON) {
    return response.json();
  }

  return response.text();
}
