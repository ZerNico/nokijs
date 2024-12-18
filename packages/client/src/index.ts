import type { Noki } from "@nokijs/server";
import { type QueryObject, joinURL, withQuery } from "ufo";
import type { ClientOptions, NokiClient } from "./types";
import { encodeBody, inferContentType, parseResponseBody } from "./utils/body";
import { joinHeaders } from "./utils/headers";

export function client<const TNoki extends Noki<any>>(
  url: string,
  options?: ClientOptions,
): NokiClient<TNoki> {
  return createProxy(url, undefined, options);
}

const createProxy = (
  domain: string,
  paths: string[] = [],
  options?: ClientOptions,
): any => {
  return new Proxy(() => {}, {
    get(_, param: string) {
      return createProxy(domain, param === "index" ? paths : [...paths, param], options);
    },

    async apply(_, __, args) {
      const p = [...paths];
      const method = p.pop();

      const pathsWithParams = p.map((path) => {
        if (path.startsWith(":")) {
          return args[0]?.params[path.slice(1)] || path;
        }

        return path;
      });

      const { query, body, headers, params, ...requestInit } =
        (args[0] as {
          params?: Record<string, string>;
          query?: QueryObject;
          body?: any;
          headers?: Record<string, string>;
        } & RequestInit) || {};

      const url = withQuery(joinURL(domain, ...pathsWithParams), query || {});

      const contentType = inferContentType(body);
      const encodedBody = encodeBody(body, contentType);

      const contentTypeHeaders = new Headers();
      if (contentType) {
        contentTypeHeaders.set("content-type", contentType);
      }


      const requestOptions = {
        method: method?.toUpperCase(),
        headers: joinHeaders(contentTypeHeaders, headers),
        body: encodedBody,
        ...requestInit,
      }

      let response = await fetch(url, requestOptions);
      
      if (options?.onResponse) {
        response = await options.onResponse({ response, url, options: requestOptions });
      }

      const typedResponse = {
        raw: response.clone(),
        data: await parseResponseBody(response),
        status: response.status,
        ok: response.ok,
      };

      return typedResponse;
    },
  });
};
