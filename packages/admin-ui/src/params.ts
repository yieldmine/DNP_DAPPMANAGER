import { urlJoin } from "utils/url";

// JSON RPC API
export const apiUrl =
  process.env.REACT_APP_API_URL || "http://my.dappmanager.dnp.dappnode.eth/";
export const apiUrls = {
  ping: urlJoin(apiUrl, "ping"),
  rpc: urlJoin(apiUrl, "rpc"),
  upload: urlJoin(apiUrl, "upload"),
  download: urlJoin(apiUrl, "download"),
  containerLogs: urlJoin(apiUrl, "container-logs"),
  userActionLogs: urlJoin(apiUrl, "user-action-logs")
};

// WIFI
export const wifiDefaultSSID = "DAppNodeWIFI";
export const wifiDefaultWPA_PASSPHRASE = "dappnode";
export const wifiEnvWPA_PASSPHRASE = "WPA_PASSPHRASE";
export const wifiEnvSSID = "SSID";

// DNP names
export const wifiDnpName = "wifi.dnp.dappnode.eth";
export const ipfsDnpName = "ipfs.dnp.dappnode.eth";
export const coreDnpName = "core.dnp.dappnode.eth";
export const bindDnpName = "bind.dnp.dappnode.eth";
export const vpnDnpName = "vpn.dnp.dappnode.eth";
export const dappmanagerDnpName = "dappmanager.dnp.dappnode.eth";
export const mandatoryCoreDnps = [
  dappmanagerDnpName,
  vpnDnpName,
  ipfsDnpName,
  bindDnpName
  // WIFI package is not mandatory to be running
  // wifiDnpName
];
export const corePackages = [...mandatoryCoreDnps, coreDnpName];
// Container names
export const wifiContainerName = "DAppNodeCore-wifi.dnp.dappnode.eth";

// NACL keys
export const adminNaclSecretKey =
  "DAppNodeDAppNodeDAppNodeDAppNodeDAppNodeDao=";
export const adminNaclPublicKey =
  "cYo1NA7/+PQ22PeqrRNGhs1B84SY/fuomNtURj5SUmQ=";

// URLs / Links
export const surveyUrl = "https://goo.gl/forms/DSy1J1OlQGpdyhD22";
export const packageSurveyLink = "https://goo.gl/forms/EjVTHu6UBWBk60Z62";
export const sdkPublishAppUrl = "https://dappnode.github.io/sdk-publish/";
export const sdkGuideUrl = "https://github.com/dappnode/DAppNodeSDK";

// AutoUpdate IDSs
export const autoUpdateIds = {
  MY_PACKAGES: "my-packages",
  SYSTEM_PACKAGES: "system-packages"
};

// VPN
export const superAdminId = "dappnode_admin";

// Support, where to send issues
const githubRepoSlugToReport = "dappnode/DAppNode";
export const issueBaseUrl = `https://github.com/${githubRepoSlugToReport}/issues/new`;