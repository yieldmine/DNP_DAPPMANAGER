import { expect } from "chai";
import { Writable } from "stream";
import fs from "fs";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import FormData from "form-data";
import fetch from "node-fetch";
import { docker } from "../../src/modules/docker/api/docker";
import {
  dockerGetArchive,
  dockerGetArchiveSingleFile,
  dockerGetArchiveSingleFileBuffered
} from "../../src/modules/docker/api/getArchive";
import { dockerInfoArchive } from "../../src/modules/docker/api/infoArchive";
import { dockerPutArchiveFiles } from "../../src/modules/docker/api/putArchive";
import { fileUpload } from "../../src/api/routes/fileUpload";

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
      await dockerPutArchiveFiles(containerName, [
        { pathAbsolute: filePath, contents: Buffer.from(fileContent) }
      ]);
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

  describe.only("Upload with API", () => {
    const afterCallbacks: (() => void)[] = [];
    afterEach(() => {
      while (afterCallbacks.length > 0) {
        const callback = afterCallbacks.pop();
        if (callback) callback();
      }
    });

    it("Upload file", async () => {
      const app = express();
      app.use(compression());
      app.use(bodyParser.json());
      app.use(bodyParser.text());
      app.use(bodyParser.urlencoded({ extended: true }));

      const port = 8965;
      app.post<{ containerName: string }>(
        "/file-upload/:containerName",
        fileUpload
      );

      const server = new http.Server(app);

      await new Promise<void>(resolve => {
        server.listen(port, () => {
          resolve();
        });
      });

      afterCallbacks.push(() => server.close());

      // Do request

      const form = new FormData();
      form.append("some_field", "some_value");
      form.append("file", fs.createReadStream(__filename));

      const url = `http://localhost:${port}/file-upload/${containerName}`;

      console.log(`Requesting ${url}`);
      const res = await fetch(url, { method: "POST", body: form });
      const resText = await res.text();
      if (!res.ok) {
        throw Error(`${res.statusText}\n${resText}`);
      }

      console.log("Done", resText);
    });
  });
});
