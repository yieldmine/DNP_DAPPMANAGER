import { PackageContainer } from "../../types";
import { getContainerDomain } from "../../params";
import { isEmpty } from "lodash";

const TTL = 60;
const ethZone = "eth.";
const dappnodeZone = "dappnode.";

interface DomainMap {
  [domain: string]: string; // ip
}

interface PackageContainerWithIp extends PackageContainer {
  ip: string;
}

interface AliasMap {
  [domainAlias: string]: string; // dnpName
}

/**
 * Rules for allowing or forbidding alias requested by the packages
 * @param alias "fullnode"
 * @param dnp Package object
 */
function isAliasAllowed(alias: string, dnp: PackageContainerWithIp): boolean {
  // For now only allow known aliases
  switch (alias) {
    case "fullnode":
      // Only allow "fullnode" if the package declares itself as an ethereum node
      return dnp.chain === "ethereum";
  }
  return false;
}

/**
 * Constructs a nsupdate.txt file contents
 *
 * @param domains [
 *   { domain: "bitcoin.dappnode", ip: "172.33.0.2" },
 *   { domain: "monero.dappnode", ip: "172.33.0.3" }
 * ]
 * @param zone "dappnode."
 * @returns nsupdate.txt contents
 *
 * server 172.33.1.2
 * debug yes
 * zone dappnode.
 * update delete bitcoin.dappnode A
 * update add bitcoin.dappnode 60 A 172.33.0.2
 * update delete monero.dappnode A
 * update add monero.dappnode 60 A 172.33.0.3
 * show
 * send
 */
function getNsupdateTxt(
  domains: DomainMap,
  zone: string,
  removeOnly: boolean
): string {
  const nsupdateInstructions = Object.entries(domains)
    .map(([domain, ip]) => {
      const rm = `update delete ${domain} A`;
      const add = `update add ${domain} ${TTL} A ${ip}`;
      return removeOnly ? rm : [rm, add].join("\n");
    })
    .join("\n");

  return `
server 172.33.1.2
debug yes
zone ${zone}
${nsupdateInstructions}
show
send
`.trim();
}

function stripCharacters(s: string): string {
  return s.replace(RegExp("_", "g"), "");
}

/**
 * - Strip container prefix
 * - Strip "_"
 *
 * @param name "bitcoin.dnp.dappnode.eth"
 * @returns "my.bitcoin.dnp.dappnode.eth"
 *
 * name=$(echo $name | sed 's/DAppNodePackage-//g'| tr -d '/_')
 */
export function getMyDotEthdomain(dnpName: string): string {
  return "my." + stripCharacters(dnpName);
}

/**
 * - Strip container prefix
 * - Strip .dappnode, .eth, .dnp
 * - Strip "_"
 *
 * @param name "bitcoin.dnp.dappnode.eth"
 * @returns "bitcoin"
 * - "bitcoin.dnp.dappnode.eth" > "bitcoin.dappnode"
 * - "other.public.dappnode.eth" > "other.public.dappnode"
 *
 * name=$(echo $name | sed 's/DAppNodePackage-//g'| sed 's/\.dappnode\.eth//g' |  sed 's/\.dnp//g' | tr -d '/_')
 */
export function getDotDappnodeDomain(dnpName: string): string {
  for (const s of [".dnp.dappnode.eth", ".dappnode.eth", ".eth"])
    if (dnpName.endsWith(s)) dnpName = dnpName.slice(0, -s.length);
  return stripCharacters(dnpName) + ".dappnode";
}

/**
 * Returns an array of nsupdate.txt files ready for nsupdate
 * If no update must happen, it returns an empty array
 *
 * Note: This call is abstracted for testability
 */
export function getNsupdateTxts({
  containers,
  domainAliases,
  dnpNames,
  removeOnly = false
}: {
  containers: PackageContainer[];
  domainAliases: AliasMap;
  dnpNames?: string[];
  removeOnly?: boolean;
}): string[] {
  const containersToUpdate: PackageContainerWithIp[] = [];
  // `dnp.ip` = Necessary to satisfy the typscript compiler
  for (const container of containers)
    if (
      container.ip &&
      container.isDnp &&
      !container.isCore &&
      (!dnpNames || !dnpNames.length || dnpNames.includes(container.dnpName))
    )
      containersToUpdate.push({ ...container, ip: container.ip });

  if (!containersToUpdate.length) return [];

  const eth: DomainMap = {};
  const dappnode: DomainMap = {};

  // Add domains from installed package names
  for (const container of containersToUpdate) {
    const fullEns = getContainerDomain(container);
    eth[getMyDotEthdomain(fullEns)] = container.ip;
    dappnode[getDotDappnodeDomain(fullEns)] = container.ip;

    // For multi-service DNPs, link the main container to the root URL
    if (container.isMain) {
      const fullDnpEns = getContainerDomain({
        dnpName: container.dnpName,
        serviceName: container.dnpName
      });
      eth[getMyDotEthdomain(fullDnpEns)] = container.ip;
      dappnode[getDotDappnodeDomain(fullDnpEns)] = container.ip;
    }
  }

  // Add dappnode domain alias from installed packages
  for (const container of containersToUpdate)
    if (container.domainAlias)
      for (const alias of container.domainAlias)
        if (isAliasAllowed(alias, container))
          dappnode[getDotDappnodeDomain(alias)] = container.ip;

  // Add .dappnode domain alias from db (such as fullnode.dappnode)
  for (const [alias, dnpName] of Object.entries(domainAliases)) {
    const container = containersToUpdate.find(
      c => dnpName && c.dnpName === dnpName
    );
    if (container) dappnode[getDotDappnodeDomain(alias)] = container.ip;
  }

  return (
    [
      { zone: ethZone, domains: eth },
      { zone: dappnodeZone, domains: dappnode }
    ]
      // Only process zones that have domains / entries
      .filter(({ domains }) => !isEmpty(domains))
      // Convert domain maps to nsupdate txts
      .map(({ zone, domains }) => getNsupdateTxt(domains, zone, removeOnly))
  );
}
