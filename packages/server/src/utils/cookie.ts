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

export function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.secure) {
    cookie += "; Secure";
  }

  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

export type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  signingSecret?: string;
  sameSite?: "Strict" | "Lax" | "None" | "strict" | "lax" | "none";
};
