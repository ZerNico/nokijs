import type { Noki } from "@nokijs/server";
import { Fetch, InferRoutes, Paths } from "./utils/types";

interface NokiClientOptions {
  url: string;
}

export class NokiClient<N extends Noki<any, any>> {
  private url: string;
  constructor({ url }: NokiClientOptions) {
    this.url = url;
  }

  public fetch: Fetch<InferRoutes<N>> = async (path) => {
    console.log("fetching", path);

    return {};
  };
}
