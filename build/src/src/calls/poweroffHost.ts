import shell from "../utils/shell";
import getDappmanagerImage from "../utils/getDappmanagerImage";
import { RpcHandlerReturn } from "../types";

const baseCommand = `docker run --rm -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket --privileged --entrypoint=""`;

/**
 * Shuts down the host machine via the DBus socket
 */
export default async function poweroffHost(): Promise<RpcHandlerReturn> {
  const image = await getDappmanagerImage();
  await shell(
    `${baseCommand} ${image} sh -c "dbus-send --system --print-reply \
    --dest=org.freedesktop.login1 /org/freedesktop/login1 \
    org.freedesktop.login1.Manager.PowerOff boolean:true"`
  );
  return {
    message: `Halted machine.`,
    logMessage: true,
    userAction: true
  };
}