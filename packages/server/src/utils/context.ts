import { getQuery } from "ufo";
import { ResponseBuilder } from "../response";
import { parseCookie } from "./cookie";

export function buildContext(request: Request) {
  return {
    cookies: parseCookie(request.headers.get("cookie") || ""),
    headers: Object.fromEntries(request.headers.entries()),
    res: new ResponseBuilder(),
    query: getQuery(request.url),
    raw: request.clone(),
  };
}

export type BaseContext = ReturnType<typeof buildContext>;
