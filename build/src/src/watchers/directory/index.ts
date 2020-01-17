import * as db from "../../db";
import { fetchRegistryEthereum } from "./ethereum";
import { fetchRegistryZeronet } from "./zeronet";
import { isEmpty, isEqual } from "lodash";
import Logs from "../../logs";
import { RawDirectory, RawDirectoryPackage } from "./temp-types";
const logs = Logs(module);

/**
 * All registries (former directories) will be consolidated
 * into one single directory list for display by checking the
 * latest timestamp
 */

type RegistryEntry =
  | {
      id: string;
      type: "dappnode-smart-contract";
      address: string;
    }
  | {
      id: string;
      type: "zeronet";
      address: string;
    };

const registryList: RegistryEntry[] = [
  {
    id: "dappnode-smart-contract",
    type: "dappnode-smart-contract",
    address: "0xf19F629642C6697Af77d8316BeF8DE0de3A27a70"
  },
  {
    id: "dappnode-zeronet",
    type: "zeronet",
    address: "1kNwQrJwCtkAa3zBF44LggEirS2j8jciA"
  }
];

/*
 * Fetch directory through the different sources available
 * - Keep a local copy of the entire directory for each source
 * - Consolidate at a latter step
 * - How to deal with IPFS versions?
 */

/**
 * Fetch a registry entry, switch between available types:
 * - Self deployed (non-standarized) Ethereum mainnet smart contract
 * - ZeroNet standarized DAppNode registry.json
 */
async function fetchRegistry(
  registryEntry: RegistryEntry
): Promise<RawDirectory> {
  switch (registryEntry.type) {
    case "dappnode-smart-contract":
      return await fetchRegistryEthereum(registryEntry.address);

    case "zeronet":
      return await fetchRegistryZeronet(registryEntry.address);

    default: {
      throw Error(`Unknown registry entry: ${JSON.stringify(registryEntry)}`);
    }
  }
}

/**
 * Fetch all listed registries at once and store them locally
 */
async function fetchRegistries() {
  await Promise.all(
    registryList.map(async registryEntry => {
      const id = registryEntry.id;
      try {
        db.registryRequestStatus.set(id, { loading: true });
        const nextRegistry = await fetchRegistry(registryEntry);
        db.registryRequestStatus.set(id, { success: true });

        const prevRegistry = db.registry.get(id);
        if (
          // No previous registry
          !prevRegistry ||
          isEmpty(prevRegistry) ||
          // Next registry is more recent
          nextRegistry.timestamp > prevRegistry.timestamp ||
          // Same timestamp but something changed (i.e. Smart contract featured order)
          (nextRegistry.timestamp === prevRegistry.timestamp &&
            !isEqual(nextRegistry, prevRegistry))
        ) {
          db.registry.set(id, nextRegistry);
          // notifyRegistryChange();
        }
      } catch (e) {
        logs.error(`Error fetching registry ZeroNet: ${e.stack}`);
        db.registryRequestStatus.set(id, { error: e.stack });
      }
    })
  );
}

/**
 * Resolve / aggregate the registries (former directories)
 * to get a single list of packages to display in the UI
 */
export function getDirectoryFromDb(): {
  packages: RawDirectoryPackage[];
  id: string;
} {
  const registries = db.registries.get();

  if (isEmpty(registries)) throw Error(`No registry in db`);

  let latestId: string = "";
  let latestTimestamp: number = 0;
  for (const [id, registry] of Object.entries(registries)) {
    if (registry.timestamp > latestTimestamp) latestId = id;
  }

  if (!registries[latestId])
    throw Error(`Error finding latest registry: ${latestId}`);

  return {
    packages: registries[latestId].packages,
    id: latestId
  };
}

/**
 * Fetch versions of the directory packages
 */

/**
 * Fetch versions of the installed packages
 */
