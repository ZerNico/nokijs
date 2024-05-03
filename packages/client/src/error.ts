import type { TypedResponse } from "./types";

export class NokiClientError<TResponse extends TypedResponse<any>> extends Error {
  public response: TResponse;
  public path: string;

  constructor(opts: { response: TResponse; path: string }) {
    super(`Request failed with status code ${opts.response.status}`);
    this.name = "NokiClientError";
    this.response = opts.response;
    this.path = opts.path;
  }

  get data(): TResponse["data"] {
    return this.response.data;
  }
}
