import "mocha";
import { expect } from "chai";
import * as calls from "../../src/calls";
import { createTestDir, beforeAndAfter } from "../testUtils";
import params from "../../src/params";
import shell from "../../src/utils/shell";
import {
  cleanInstallationArtifacts,
  uploadDirectoryRelease,
  uploadManifestRelease
} from "../integrationSpecs";
import { mockImageEnvNAME } from "../integrationSpecs/mockImage";
import { mapValues } from "lodash";

/**
 * Generate mock releases in the different formats,
 * and try to retrieve and run them
 * - IPFS directory with docker-compose
 * - IPFS manifest, generate docker-compose from manifest
 */

/**
 * Aggregate the three type of tests
 * - Directory-type (with docker-compose)
 * - Multi-service-type
 * - Manifest-type
 *
 * [NOTE] There are different default `NAME` env values
 * in the different files that each release typeis using
 */

describe("Release format tests", () => {
  const testMockPrefix = "testmock-";

  // The mockImage used for this test will print to stdout the value
  // of the env `mockImageEnvNAME`. It will be used to assert that the
  // package is running correctly
  const mockEnvs = (expectedValue: string): string[] => [
    [mockImageEnvNAME, expectedValue].join("=")
  ];

  interface TestCase {
    id: string;
    dnpName: string;
    version: string;
    expectedEnvValues: { [serviceName: string]: string };
    prepareRelease: () => Promise<string>;
  }

  const releaseTests: (() => TestCase)[] = [
    (): TestCase => {
      const dnpName = testMockPrefix + "mainfest.dnp.dappnode.eth";
      const version = "0.1.0";
      const expectedEnvValue = dnpName;
      return {
        id: "Manifest-type",
        dnpName,
        version,
        expectedEnvValues: { [dnpName]: expectedEnvValue },
        prepareRelease: async (): Promise<string> => {
          const dnpName = testMockPrefix + "mainfest.dnp.dappnode.eth";
          const version = "0.1.0";

          return await uploadManifestRelease({
            name: dnpName,
            version,
            description: "mock-test description",
            avatar: "/ipfs/QmNrfF93ppvjDGeabQH8H8eeCDLci2F8fptkvj94WN78pt",
            type: "service",
            image: {
              path: `${dnpName}_0.0.1.tar.xz`,
              hash: "",
              size: 0,
              restart: "always",
              environment: mockEnvs(expectedEnvValue)
            },
            author: "lion",
            license: "GLP-3.0"
          });
        }
      };
    },

    (): TestCase => {
      const dnpName = testMockPrefix + "directory.dnp.dappnode.eth";
      const version = "0.2.0";
      const expectedEnvValue = dnpName;
      return {
        id: "Directory-type",
        dnpName,
        version,
        expectedEnvValues: { [dnpName]: expectedEnvValue },
        prepareRelease: async (): Promise<string> =>
          uploadDirectoryRelease({
            manifest: {
              name: dnpName,
              version: version,
              description: "mock-test description",
              avatar: "/ipfs/QmNrfF93ppvjDGeabQH8H8eeCDLci2F8fptkvj94WN78pt",
              type: "service",
              author: "lion",
              license: "GLP-3.0"
            },
            compose: {
              version: "3.4",
              services: {
                [dnpName]: {
                  restart: "always",
                  environment: mockEnvs(expectedEnvValue)
                }
              }
            }
          })
      };
    },

    (): TestCase => {
      const dnpName = testMockPrefix + "multi-service.dnp.dappnode.eth";
      const version = "0.3.0";
      const serviceNames = { frontend: "frontend", backend: "backend" };
      const expectedEnvValues = mapValues(serviceNames, value =>
        [value, dnpName].join(".")
      );
      return {
        id: "Multi-service-type",
        dnpName,
        version,
        expectedEnvValues,
        prepareRelease: async (): Promise<string> =>
          uploadDirectoryRelease({
            manifest: {
              name: dnpName,
              version: version,
              description: "mock-test description",
              avatar: "/ipfs/QmNrfF93ppvjDGeabQH8H8eeCDLci2F8fptkvj94WN78pt",
              type: "service",
              author: "lion",
              license: "GLP-3.0"
            },
            compose: {
              version: "3.4",
              services: {
                [serviceNames.frontend]: {
                  restart: "always",
                  environment: mockEnvs(expectedEnvValues.frontend)
                },
                [serviceNames.backend]: {
                  restart: "always",
                  environment: mockEnvs(expectedEnvValues.backend)
                }
              }
            }
          })
      };
    }
  ];

  before("Create DAppNode docker network", async () => {
    const dncoreNetwork = params.DNP_NETWORK_EXTERNAL_NAME;
    const networkExists = await shell(
      `docker network ls --filter name=${dncoreNetwork} -q`
    );
    if (!networkExists) await shell(`docker network create ${dncoreNetwork}`);
  });

  for (const releaseTest of releaseTests) {
    const {
      id,
      dnpName,
      version,
      prepareRelease,
      expectedEnvValues
    } = releaseTest();
    describe(id, () => {
      let releaseHash: string;

      beforeAndAfter("Clean files", async () => {
        await createTestDir();
        await cleanInstallationArtifacts(testMockPrefix);
      });

      it("Should generate mock release and upload it", async () => {
        releaseHash = await prepareRelease();
        console.log(`Uploaded mock: ${id}\n  ${releaseHash}`);
      });

      it("Get the release", async () => {
        if (!releaseHash) throw Error("Previous test failed");

        const result = await calls.fetchDnpRequest({ id: releaseHash });

        expect(result.dnpName).to.equal(dnpName, "Wrong manifest name");
        expect(result.semVersion).to.equal(version, "Wrong manifest version");
      });

      it("Install the release", async () => {
        if (!releaseHash) throw Error("Previous test failed");

        await calls.packageInstall({
          name: dnpName,
          version: releaseHash
          // userSetEnvs: { [releaseDnpName]: { NAME: nameEnv } }
        });

        // Verify it is running correctly
        const dnps = await calls.packagesGet();
        const dnp = dnps.find(d => d.dnpName === dnpName);
        if (!dnp) throw Error(`DNP ${dnpName} not found`);

        for (const [serviceName, expectedEnvValue] of Object.entries(
          expectedEnvValues
        )) {
          const container = dnp.containers.find(
            c => c.serviceName === serviceName
          );
          if (!container)
            throw Error(`No service found for ${serviceName} ${dnpName}`);

          // The mockImage used for this test will print to stdout the value of an ENV
          // It is used to assert that the package is running correctly
          const result = await calls.packageLog(container);
          expect(result).to.include(
            expectedEnvValue,
            `Wrong log from ${serviceName} ${dnpName} after installation`
          );
        }
      });
    });
  }

  after("Remove DAppNode docker network", async () => {
    await shell(`docker network remove ${params.DNP_NETWORK_EXTERNAL_NAME}`);
  });
});