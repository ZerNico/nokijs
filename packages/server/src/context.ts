import { type QueryObject, getQuery, parseQuery } from "ufo";
import { ResponseBuilder } from "./response";
import { parseCookies } from "./utils/cookies";

export interface BaseContext {
  raw: Request;
  res: ResponseBuilder;
  query: QueryObject;
  getCookie(name: string): string | undefined;
}

export function createContextFromRequest(request: Request): BaseContext {
  const cookies = parseCookies(request.headers.get("cookie") || "");

  return {
    raw: request.clone(),
    res: new ResponseBuilder(),
    query: getQuery(request.url),
    getCookie: (name: string) => {
      return cookies[name];
    },
  };
}
