import { listContainers } from "../../modules/docker/listContainers";
import * as db from "../../db";
import {
  fetchRegistryEthereum,
  ensureRegistryAvailableEthereum
} from "./ethereum";
import {
  fetchRegistryZeronet,
  ensureRegistryAvailableZeronet
} from "./zeronet";
import Logs from "../../logs";
const logs = Logs(module);

/**
 * Fetch directory through the different sources available
 * - Keep a local copy of the entire directory for each source
 * - Consolidate at a latter step
 * - How to deal with IPFS versions?
 */

const ethchainName = "ethchain.dnp.dappnode.eth";
const zeronetName = "zeronet.dnp.dappnode.eth";

async function fetchRegistry() {
  const dnpList = await listContainers();
  /**
   * Checks is a package is installed and running, otherwise throws
   * @param dnpName
   */
  function checkPackageIsRunning(dnpName: string): void {
    const dnp = dnpList.find(({ name }) => name === dnpName);
    if (!dnp) throw Error(`Not installed`);
    if (!dnp.running) throw Error(`Not running`);
  }

  await Promise.all([
    // From ZeroNet
    async (): Promise<void> => {
      try {
        // Can get registry from ZeroNet? Package running
        try {
          checkPackageIsRunning(zeronetName);
          await ensureRegistryAvailableZeronet();
        } catch (e) {
          logs.debug(`Registry from ZeroNet not available: ${e.message}`);
          db.directoryZeronetStatus.set({ error: e.message });
          return;
        }

        db.directoryZeronetStatus.set({ loading: true });
        const registry = await fetchRegistryZeronet();
        db.directoryZeronet.set(registry);
        db.directoryZeronetStatus.set({ success: true });
      } catch (e) {
        logs.error(`Error fetching registry ZeroNet: ${e.stack}`);
        db.directoryZeronetStatus.set({ error: e.stack });
      }
    },

    // From Ethereum
    async (): Promise<void> => {
      try {
        // Can get registry from APM Mainnet? Package running, synced
        try {
          checkPackageIsRunning(ethchainName);
          await ensureRegistryAvailableEthereum();
        } catch (e) {
          logs.debug(`Registry from Ethereum not available: ${e.message}`);
          db.directoryEthereumStatus.set({ error: e.message });
          return;
        }

        db.directoryEthereumStatus.set({ loading: true });
        const registry = await fetchRegistryEthereum();
        db.directoryEthereum.set(registry);
        db.directoryEthereumStatus.set({ success: true });
      } catch (e) {
        logs.error(`Error fetching registry Ethereum: ${e.stack}`);
        db.directoryEthereumStatus.set({ error: e.stack });
      }
    }
  ]);
}

/**
 * Fetch versions of the directory packages
 */

/**
 * Fetch versions of the installed packages
 */
