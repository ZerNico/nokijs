import { getQuery } from "ufo";
import { ResponseBuilder } from "./response";
import { parseCookie } from "./utils/cookie";

export function buildContext(request: Request) {
  const cookies = parseCookie(request.headers.get("cookie") || "");

  return {
    getCookie(name: string) {
      return cookies[name];
    },
    headers: Object.fromEntries(request.headers.entries()),
    res: new ResponseBuilder(),
    query: getQuery(request.url),
    raw: request.clone(),
  };
}

export type BaseContext = ReturnType<typeof buildContext>;
