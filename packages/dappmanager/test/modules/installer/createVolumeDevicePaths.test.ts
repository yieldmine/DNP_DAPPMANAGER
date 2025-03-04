import "mocha";
import { expect } from "chai";
import { Compose } from "../../../src/types";

import { getVolumeDevicePaths } from "../../../src/modules/installer/createVolumeDevicePaths";

describe("Module > installer > createVolumeDevicePaths", () => {
  it("Should parse the list of volume paths to create from compose", () => {
    const devicePath =
      "/mnt/volume_ams3_01/dappnode-volumes/raiden.dnp.dappnode.eth/data";

    const compose: Compose = {
      version: "3.4",
      services: {
        "raiden.dnp.dappnode.eth": {
          volumes: ["data:/root/.raiden"],
          container_name: "DAppNodePackage-raiden.dnp.dappnode.eth",
          image: "raiden.dnp.dappnode.eth:0.0.2"
        }
      },
      volumes: {
        data: {
          driver_opts: {
            type: "none",
            device: devicePath,
            o: "bind"
          }
        }
      },
      networks: {
        dncore_network: {
          external: true
        }
      }
    };

    expect(getVolumeDevicePaths([{ compose }])).to.deep.equal([devicePath]);
  });
});
