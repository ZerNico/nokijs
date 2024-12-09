export function parseCookies(cookies: string): Record<string, string> {
  const c: Record<string, string> = {};

  for (const cookie of cookies.split(";")) {
    const [key, value] = cookie.split("=");

    if (key && value) {
      let v = value.trim();

      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1);
      }

      c[key.trim()] = v;
    }
  }

  return c;
}

export function serializeCookie(
  name: string,
  value: string,
  opts: CookieOptions = {},
): string {
  const parts = [`${name}=${value}`];

  if (opts.domain) {
    parts.push(`Domain=${opts.domain}`);
  }

  if (opts.expires) {
    parts.push(`Expires=${opts.expires.toUTCString()}`);
  }

  if (opts.httpOnly) {
    parts.push("HttpOnly");
  }

  if (opts.maxAge) {
    parts.push(`Max-Age=${opts.maxAge}`);
  }

  if (opts.path) {
    parts.push(`Path=${opts.path}`);
  }

  if (opts.secure) {
    parts.push("Secure");
  }

  if (opts.sameSite) {
    parts.push(`SameSite=${opts.sameSite}`);
  }

  return parts.join("; ");
}

export type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None" | "strict" | "lax" | "none";
};
