import shell from "./shell";
import isIp from "is-ip";
import { logs } from "../logs";

export default async function getLocalIp(options?: {
  silent: boolean;
}): Promise<string | undefined> {
  const silent = options && options.silent;

  try {
    const image = await shell(
      `docker inspect DAppNodeCore-dappmanager.dnp.dappnode.eth -f '{{.Config.Image}}'`
    );
    const output = await shell(
      `docker run --rm --net=host --entrypoint=/sbin/ip ${image} route get 1`
    );
    const internalIp = ((output || "").match(/src\s((\d+\.?){4})/) || [])[1];
    return isIp(internalIp) ? internalIp : undefined;
  } catch (e) {
    if (!silent) logs.error(`Error getting internal IP: ${e.message}`);
  }
}
