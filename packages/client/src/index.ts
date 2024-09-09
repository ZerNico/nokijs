import type { Noki } from "@nokijs/server";
import { type QueryObject, joinURL, withQuery } from "ufo";
import { NokiClientError } from "./error";
import type { Client } from "./types";
import { buildTypedResponse, detectRequestContentType } from "./utils";

export const client = <const TNoki extends Noki<any>, TBasePath extends string = "">(domain: string): Client<TNoki, TBasePath> => {
  return createProxy(domain);
};

const createProxy = (domain: string, paths: string[] = []): any => {
  return new Proxy(() => {}, {
    get(_, param: string): any {
      return createProxy(domain, param === "index" ? paths : [...paths, param]);
    },

    async apply(_, __, args) {
      const p = [...paths];
      const method = p.pop();

      const mappedPaths = p.map((path) => {
        if (path.startsWith(":")) {
          return args[0].params[path.slice(1)];
        }
        return path;
      });

      const headers = new Headers(args[0]?.headers);
      const query = args[0]?.query as QueryObject | undefined;

      const url = withQuery(joinURL(domain, ...mappedPaths), query || {});

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", detectRequestContentType(args[0]?.body));
      }

      const body = headers.get("Content-Type") === "application/json" ? JSON.stringify(args[0]?.body) : args[0]?.body;

      const response = await fetch(url, {
        method,
        headers: headers,
        body: body,
      });

      const typedResponse = await buildTypedResponse(response);

      if (!response.ok) {
        throw new NokiClientError({ response: typedResponse, path: p.join("/") });
      }

      return typedResponse;
    },
  });
};
