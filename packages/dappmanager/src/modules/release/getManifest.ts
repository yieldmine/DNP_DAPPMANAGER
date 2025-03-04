import ipfsCatString from "../ipfs/methods/catString";
import { validateManifestBasic } from "../manifest";
import { Manifest } from "../../types";

export async function getManifest(contentUri: string): Promise<Manifest> {
  return ipfsCatString({ hash: contentUri })
    .catch((e: Error) => {
      if (e.message.includes("is a directory"))
        return ipfsCatString({ hash: contentUri + "/dappnode_package.json" });
      else throw e;
    })
    .then(JSON.parse)
    .then(validateManifestBasic);
}
