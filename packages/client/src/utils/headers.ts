export function joinHeaders(...headers: (HeadersInit | undefined)[]): Headers {
  const result = new Headers();

  for (const header of headers) {
    for (const [key, value] of new Headers(header)) {
      result.append(key, value);
    }
  }

  return result;
}
