import { vi } from "vitest";
import createFetchMock, { type FetchMock } from "vitest-fetch-mock";

export const fetchMock: FetchMock = createFetchMock(vi);

fetchMock.enableMocks();
