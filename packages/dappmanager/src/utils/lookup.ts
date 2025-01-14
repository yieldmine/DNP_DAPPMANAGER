import dns from "dns";

/**
 * Does a dns.lookup to resolve a hostname
 * Usage:
 *   `await lookup("ipfs.io")` > "209.94.90.1"
 *
 * @param hostname = "ipfs.io"
 * @param options, available options:
 * - ignoreErrors: {bool}. If true, on error doesn't log anything
 *   and returns null
 * @returns address = "209.94.90.1"
 *
 *  Error: getaddrinfo EAI_AGAIN
 */
export default async function lookup(
  hostname: string,
  ignoreErrors?: boolean
): Promise<string | null> {
  try {
    const { address } = await dns.promises.lookup(hostname);
    return address;
  } catch (e) {
    if (ignoreErrors) return null;
    else throw e;
  }
}
