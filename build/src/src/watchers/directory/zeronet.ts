import ZeroFrame from "../../modules/zeronet/zeroframe";
import {
  RawDirectory,
  RawDirectoryPackage,
  RawRelease
} from "../../watchers/directory/temp-types";

// Path settings
const registryPath = "registry.json";
const releasesPath = "releases.json";

/**
 * Fetches the DAppNode directory from ZeroNet
 */
export async function fetchRegistryZeronet(
  address: string
): Promise<RawDirectory> {
  await ensureRegistryAvailableZeronet();

  const zeroframe = ZeroFrame(address);
  const siteInfo = await zeroframe.siteInfo();
  const registry = await zeroframe.fileGetJson<RawDirectoryPackage[]>(
    registryPath
  );
  zeroframe.close();

  // #### Todo: Sanitize registry

  return {
    timestamp: siteInfo.content.modified,
    packages: registry
  };
}

/**
 * Fetch a package releases from ZeroNet
 */
export async function fetchReleases(
  zeronetAddress: string
): Promise<RawRelease[]> {
  const zeroframe = ZeroFrame(zeronetAddress);
  const siteInfo = await zeroframe.siteInfo();
  const releases = await zeroframe.fileGetJson<RawRelease[]>(releasesPath);
  zeroframe.close();

  // #### Todo: Sanitize releases

  return releases;
}

/**
 * Checks that the registry is fetchable from ZeroNet
 * Otherwise will throw with the reason why not
 */
export async function ensureRegistryAvailableZeronet(): Promise<void> {
  //
}
