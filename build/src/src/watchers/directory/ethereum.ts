import getDirectory, {
  getLastDirectoryUpdateTimestamp
} from "../../modules/release/getDirectory";
import { RawDirectory, RawDirectoryPackage } from "./temp-types";
import isSyncing from "../../utils/isSyncing";
import fetchAllVersions from "../../modules/release/apm/fetchAllVersions";

/**
 * Fetches the directory from Ethereum mainnet
 * - Timestamp is provided by the block time at which the query is done
 *   #### This timestamp is dynamic! Find a better way
 */
export async function fetchRegistryEthereum(
  address: string
): Promise<RawDirectory> {
  await ensureRegistryAvailableEthereum();

  const directory = await getDirectory(address);
  const packages = directory.map(({ name, isFeatured, statusName }) => {
    const dnp: RawDirectoryPackage = {
      // Sources
      apm: name,
      // Metadata
      name,
      status: statusName,
      isFeatured,
      isTrusted: name.endsWith(".dnp.dappnode.eth")
    };
    return dnp;
  });

  const timestamp = await getLastDirectoryUpdateTimestamp();

  return {
    timestamp,
    packages
  };
}

/**
 * Checks that the registry is fetchable from Ethereum
 * Otherwise will throw with the reason why not
 */
export async function ensureRegistryAvailableEthereum(): Promise<void> {
  if (await isSyncing()) throw Error(`Syncing`);
}
