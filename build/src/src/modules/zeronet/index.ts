import ZeroFrame from "./zeroframe";

const releasesPath = "releases.json";

export async function fetchRelease(zeronetAddress: string) {
  const zeroframe = ZeroFrame(zeronetAddress);
  const siteInfo = await zeroframe.siteInfo();
  const releases = await zeroframe.fileGetJson(releasesPath);
  zeroframe.close();
  return releases;
}
