import { expect } from "chai";
import { Writable } from "stream";
import { docker } from "../../../src/modules/docker/api/docker";
import {
  dockerGetArchive,
  dockerGetArchiveSingleFile,
  dockerGetArchiveSingleFileBuffered
} from "../../../src/modules/docker/api/getArchive";
import { dockerInfoArchive } from "../../../src/modules/docker/api/infoArchive";
import { dockerPutArchiveSingleFile } from "../../../src/modules/docker/api/putArchive";

describe("docker / archive put, get", function() {
  const containerName = "DAppNodeTest-file-transfer";
  const filePath = "/a/b/c/sample.json";
  const dirPath = "/usr"; // Heavy directory in nginx:alpine image
  const fileContent = JSON.stringify(
    { sampleConfig: true, someValue: "a".repeat(10000) },
    null,
    2
  );

  async function removeContainer(): Promise<void> {
    const container = docker.getContainer(containerName);
    await container.remove({ force: true });
  }

  before("Remove previous container", async function() {
    await removeContainer().catch(() => {
      //
    });
  });

  // after("Remove test container", async () => {
  //   await removeContainer();
  // });

  before("Start test container", async function() {
    this.timeout(60 * 1000);

    const container = await docker.createContainer({
      Image: "nginx:alpine",
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      OpenStdin: false,
      StdinOnce: false,
      name: "DAppNodeTest-file-transfer"
    });

    await container.start();
  });

  describe("Single file", () => {
    it("Should put a file", async () => {
      await dockerPutArchiveSingleFile(
        containerName,
        filePath,
        Buffer.from(fileContent)
      );
    });

    it("Should get file info", async () => {
      const info = await dockerInfoArchive(containerName, filePath);
      console.log(info);
    });

    it("Should get a file as a promise", async () => {
      const returnedFileBuffer = await dockerGetArchiveSingleFileBuffered(
        containerName,
        filePath
      );
      const returnedFileContent = returnedFileBuffer.toString("utf8");
      expect(returnedFileContent).to.equal(
        fileContent,
        "returned file does not match put file"
      );
    });

    it("Should get a file with a writable stream", async () => {
      const returnedFileBufferArr: Buffer[] = [];
      const fileContentSink = new Writable({
        write: (chunk, encoding, cb): void => {
          returnedFileBufferArr.push(chunk);
          cb();
        }
      });

      await dockerGetArchiveSingleFile(
        containerName,
        filePath,
        fileContentSink
      );

      const returnedFileBuffer = Buffer.concat(returnedFileBufferArr);
      const returnedFileContent = returnedFileBuffer.toString("utf8");
      expect(returnedFileContent).to.equal(
        fileContent,
        "returned file does not match put file"
      );
    });
  });

  describe("Directory", () => {
    it("Should get dir info", async () => {
      const info = await dockerInfoArchive(containerName, dirPath);
      console.log(info);
    });

    it.skip("Should get a file with a stream", async () => {
      const returnedFileBufferArr: Buffer[] = [];
      const fileContentSink = new Writable({
        write: (chunk, encoding, cb): void => {
          returnedFileBufferArr.push(chunk);
          cb();
        }
      });

      await dockerGetArchiveSingleFile(containerName, dirPath, fileContentSink);

      const returnedFileBuffer = Buffer.concat(returnedFileBufferArr);
      const returnedFileContent = returnedFileBuffer.toString("utf8");
      expect(returnedFileContent).to.equal(
        fileContent,
        "returned file does not match put file"
      );
    });
  });
});
