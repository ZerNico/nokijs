export async function parseBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return;
  }

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    return data;
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    return data;
  }

  if (contentType.includes("text/plain")) {
    return await request.text();
  }
}
