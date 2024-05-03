export async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type");

  if (contentType?.startsWith("application/json")) {
    return request.json();
  }

  if (contentType?.startsWith("text/plain")) {
    return request.text();
  }

  if (contentType?.startsWith("application/x-www-form-urlencoded") || contentType?.startsWith("multipart/form-data")) {
    return Object.fromEntries(await request.formData());
  }
}
