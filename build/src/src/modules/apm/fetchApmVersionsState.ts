import { ethers } from "ethers";
import { ApmVersionState } from "./types";
import * as repoContract from "../../contracts/repository";
import { parseApmVersionReturn, linspace } from "./apmUtils";

interface ApmVersionStateObj {
  [version: string]: ApmVersionState;
}

/**
 * Fetch all versions of an APM repo
 * If provided version request range, only returns satisfying versions
 * @param name "bitcoin.dnp.dappnode.eth"
 */
export async function fetchApmVersionsState(
  provider: ethers.providers.Provider,
  name: string,
  lastVersionId = 0
): Promise<ApmVersionStateObj> {
  const repo = new ethers.Contract(name, repoContract.abi, provider);

  const versionCount: number = await repo.getVersionsCount().then(parseFloat);

  /**
   * Versions called by id are ordered in ascending order.
   * The min version = 1 and the latest = versionCount
   *
   *  i | semanticVersion
   * ---|------------------
   *  1 | [ '0', '1', '0' ]
   *  2 | [ '0', '1', '1' ]
   *  3 | [ '0', '1', '2' ]
   *  4 | [ '0', '2', '0' ]
   *
   * versionIndexes = [1, 2, 3, 4, 5, ...]
   */
  // Guard against bugs that can cause // negative values
  if (isNaN(lastVersionId) || lastVersionId < 0) lastVersionId = 0;
  const versionIndexes = linspace(lastVersionId + 1, versionCount);
  const versionsState: ApmVersionStateObj = {};
  await Promise.all(
    versionIndexes.map(async i => {
      const res = await repo.getByVersionId(i);
      const version = parseApmVersionReturn(res);
      versionsState[version.version] = {
        ...version,
        versionId: i
      };
    })
  );
  return versionsState;
}
