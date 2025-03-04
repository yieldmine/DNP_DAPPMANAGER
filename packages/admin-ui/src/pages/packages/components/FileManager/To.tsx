import React, { useState, useEffect } from "react";
import { api } from "api";
// Components
import Input from "components/Input";
import Button from "components/Button";
// Utils
import fileToDataUri from "utils/fileToDataUri";
import humanFileSize from "utils/humanFileSize";
import { shortNameCapitalized as sn } from "utils/format";
import { withToast } from "components/toast/Toast";

const fileSizeWarning = 1e6;

export function CopyFileTo({
  containerName,
  toPathDefault
}: {
  containerName: string;
  toPathDefault?: string;
}) {
  const [file, setFile] = useState<File>();
  const [toPath, setToPath] = useState("");

  useEffect(() => {
    if (toPathDefault) setToPath(toPathDefault);
  }, [toPathDefault]);

  const { name, size } = file || {};

  async function uploadFile() {
    if (file)
      try {
        const dataUri = await fileToDataUri(file);
        const filename = name || "";
        await withToast(
          () =>
            api.copyFileTo({
              containerName,
              dataUri,
              filename: name || "",
              toPath
            }),
          {
            message: `Copying file ${filename} to ${sn(
              containerName
            )} ${toPath}...`,
            onSuccess: `Copied file ${filename} to ${sn(
              containerName
            )} ${toPath}`
          }
        );
      } catch (e) {
        console.error(
          `Error on copyFileTo ${containerName} ${toPath}: ${e.stack}`
        );
      }
  }

  return (
    <div className="card-subgroup">
      {/* TO, choose source file */}
      <div className="input-group mb-3">
        <div className="custom-file">
          <input
            type="file"
            className="custom-file-input"
            onChange={e => {
              if (e && e.target && e.target.files && e.target.files[0])
                setFile(e.target.files[0]);
            }}
          />
          <label className="custom-file-label" htmlFor="inputGroupFile01">
            {name ? `${name} (${humanFileSize(size || 0)})` : "Choose file"}
          </label>
        </div>
      </div>

      {name && size && size > fileSizeWarning && (
        <div className="alert alert-secondary">
          Note that this tool is not meant for large file transfers. Expect
          unstable behaviour.
        </div>
      )}

      {/* TO, choose destination path */}
      <Input
        placeholder="Defaults to $WORKDIR/"
        value={toPath}
        onValueChange={setToPath}
        onEnterPress={uploadFile}
        append={
          <Button onClick={uploadFile} disabled={!file} variant="dappnode">
            Upload
          </Button>
        }
      />
    </div>
  );
}
