export function parseCookie(cookie: string) {
  if (cookie === "") {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookiePairs = cookie.split(";").filter((cookiePart) => cookiePart.trim() !== "");

  for (const cookiePair of cookiePairs) {
    const [key, value] = cookiePair.split("=").map((part) => part.trim());

    if (key !== undefined) {
      const decodedValue = value === undefined ? "" : decodeURIComponent(value);
      cookies[key] = decodedValue;
    }
  }

  return cookies;
}
