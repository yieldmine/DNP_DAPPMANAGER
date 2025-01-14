import * as ipfsParams from "./ipfsParams";
import retry from "async-retry";
import { isIpfsHash } from "../../utils/validate";

// Methods
import catRaw from "./methods/cat";
import catStringRaw from "./methods/catString";
import catStreamToFsRaw from "./methods/catStreamToFs";
import lsRaw from "./methods/ls";
import objectSizeRaw from "./methods/objectSize";

// Params
const params: retry.Options = {
  retries: ipfsParams.times || 3,
  minTimeout: ipfsParams.intervalBase || 225
};

async function isAvailable(hash: string): Promise<void> {
  if (!isIpfsHash(hash)) throw Error(`Invalid IPFS hash: ${hash}`);
  // Reformat the hash, some methods do not tolerate the /ipfs/ prefix
  hash = hash.split("ipfs/")[1] || hash;

  await objectSizeRaw(hash).catch(e => {
    // ky specific timeout errors https://github.com/sindresorhus/ky/blob/2f37c3f999efb36db9108893b8b3d4b3a7f5ec45/index.js#L127-L132
    if (e.name === "TimeoutError" || e.message.includes("timed out"))
      throw Error(`Ipfs hash not available: ${hash}`);
    else throw Error(`Ipfs hash ${hash} not available error: ${e.message}`);
  });
}

/**
 * Second, wrap the wrapped methods with a check to verify if the
 * hash is available in the current peers. This availability check
 * is itself wrapped in a retry async flow.
 */

function wrapMethodWithIsAvailableAndRetry<A extends { hash: string }, R>(
  method: (kwargs: A) => Promise<R>
): (kwargs: A) => Promise<R> {
  return async function(kwargs: A): Promise<R> {
    await retry(() => isAvailable(kwargs.hash), params);
    return await retry(() => method(kwargs), params);
  };
}

export const cat = wrapMethodWithIsAvailableAndRetry(catRaw);
export const catString = wrapMethodWithIsAvailableAndRetry(catStringRaw);
export const catStreamToFs = wrapMethodWithIsAvailableAndRetry(
  catStreamToFsRaw
);
export const ls = wrapMethodWithIsAvailableAndRetry(lsRaw);
