import { type QueryObject, getQuery, parseQuery } from "ufo";
import { ResponseBuilder } from "./response";

export interface BaseContext {
  raw: Request;
  res: ResponseBuilder;
  query: QueryObject;
}

export function createContextFromRequest(request: Request): BaseContext {
  return {
    raw: request.clone(),
    res: new ResponseBuilder(),
    query: getQuery(request.url),
  };
}
