import fs from "fs";
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import FormData from "form-data";
import fetch from "node-fetch";
import { docker } from "../../../src/modules/docker/api/docker";
import { fileUpload } from "../../src/api/routes/fileUpload";

describe("API route - file upload", function() {
  this.timeout(60 * 1000);

  const containerName = "DAppNodeTest-file-transfer";
  const filePath = "/a/b/c/sample.json";
  const dirPath = "/usr"; // Heavy directory in nginx:alpine image

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

    const containerName = "container-name";

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
