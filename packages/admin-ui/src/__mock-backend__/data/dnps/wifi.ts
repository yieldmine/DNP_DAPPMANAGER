import { MockDnp } from "./types";

const dnpName = "wifi.dnp.dappnode.eth";
const serviceName = dnpName;

export const wifi: MockDnp = {
  metadata: {
    name: dnpName,
    version: "0.2.6",
    description: "DAppNode wifi",
    type: "dncore"
  },

  installedData: {
    version: "0.2.6",
    userSettings: {
      environment: {
        [serviceName]: {
          SSID: "YieldMineWIFI",
          WPA_PASSPHRASE: "yieldmine"
        }
      }
    }
  },
  installedContainers: {
    [serviceName]: {
      state: "running"
    }
  }
};
