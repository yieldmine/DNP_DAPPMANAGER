import {
  ZeronetSiteInfo,
  ZeronetContentJson,
  ZeronetServerInfo
} from "./types-zeroframes";
const ZeroFrame = require("zeroframe-ws-client/pkg");

// Host settings
const zeronetHost = "zeronet.dappnode";
const zeronetPort = 80;

export default function ZeroFrameTs(siteAddress: string) {
  const zeroframe = new ZeroFrame(siteAddress, {
    instance: {
      host: zeronetHost,
      port: zeronetPort
    }
  });

  const timeout = 10; // Seconds
  const messageIdAdmin = 1000000;

  function parseJson<T>(data: string): T {
    if (typeof data !== "string")
      throw Error(`Parsing non string: ${JSON.stringify(data)}`);
    try {
      return JSON.parse(data);
    } catch (e) {
      throw Error(`Error parsing JSON ${data.slice(0, 100)}: ${e.message}`);
    }
  }

  /**
   * To get admin priviledges the messageId has to be > 1000000
   */
  function ensureAdmin() {
    if (zeroframe.nextMessageId < messageIdAdmin)
      zeroframe.nextMessageId = messageIdAdmin;
  }

  /**
   * Returns info about a single site
   * File list in not provided. Use contentJsonGet for it
   */
  async function siteInfo(): Promise<ZeronetSiteInfo> {
    const siteInfo: string | ZeronetSiteInfo | null = await zeroframe.cmdp(
      "siteInfo"
    );
    if (!siteInfo) throw Error("Null site info");
    if (typeof siteInfo === "string")
      return parseJson<ZeronetSiteInfo>(siteInfo);
    return siteInfo;
  }

  /**
   * #### Todo, requires admin priviledges
   */
  async function siteList(): Promise<ZeronetSiteInfo[]> {
    ensureAdmin();
    const siteList = await zeroframe.cmdp("siteList", {
      connecting_sites: true
    });
    if (!siteList) throw Error("Null site list");
    return siteList;
  }

  /**
   * Download a single file as text
   * If the file is not available it will timeout
   * @param innerPath "index.html", "releases.json"
   */
  async function fileGet(innerPath: string): Promise<string> {
    const fileData: string | null = await zeroframe.cmdp("fileGet", {
      inner_path: innerPath,
      timeout
    });
    if (!fileData) throw Error(`Null file get ${innerPath}`);
    return fileData;
  }

  /**
   * Download a single file as JSON
   * @param innerPath "releases.json"
   */
  async function fileGetJson<T>(innerPath: string): Promise<T> {
    const dataString = await fileGet(innerPath);
    return parseJson<T>(dataString);
  }

  /**
   * Get the content.json file with all the info about the site
   * and the list of its files
   */
  async function contentJsonGet(): Promise<ZeronetContentJson> {
    const contentJson = await fileGetJson<ZeronetContentJson>("content.json");
    return contentJson;
  }

  // Server

  /**
   * Get server info
   * Check if status is ok
   * - PORT: OPENED
   * - TOR: AVAILABLE
   * - TRACKERS: 12/16
   */
  async function serverInfo(): Promise<ZeronetServerInfo> {
    const serverInfo = await zeroframe.cmdp("serverInfo");
    return serverInfo;
  }

  /**
   * Close the underlying websocket connection
   */
  function close() {
    return zeroframe.close();
  }

  return {
    siteInfo,
    siteList,
    fileGet,
    fileGetJson,
    contentJsonGet,
    serverInfo,
    close
  };
}
