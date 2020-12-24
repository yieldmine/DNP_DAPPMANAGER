import React, { useState, useEffect } from "react";
import { fileUpload } from "api/routes";
// Components
import Input from "components/Input";
import Button from "components/Button";
import ErrorView from "components/ErrorView";
import Ok from "components/Ok";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
// Utils
import humanFS from "utils/humanFileSize";
import humanFileSize from "utils/humanFileSize";
import { ReqStatus } from "types";

interface ProgressStatus {
  label: string;
  percent?: number;
}

export function CopyFileTo({
  containerName,
  toPathDefault
}: {
  containerName: string;
  toPathDefault?: string;
}) {
  const [file, setFile] = useState<File>();
  const [toPath, setToPath] = useState("");
  const [reqStatus, setReqStatus] = useState<ReqStatus<true, ProgressStatus>>(
    {}
  );

  useEffect(() => {
    if (toPathDefault) setToPath(toPathDefault);
  }, [toPathDefault]);

  const { name, size } = file || {};

  /**
   * Upload single file to container
   */
  async function uploadFile() {
    if (!file) return;

    try {
      setReqStatus({ loading: { label: "Loading..." } });

      await fileUpload(file, { containerName, path: toPath }, e => {
        const percent = parseFloat((100 * e.fraction).toFixed(2));
        setReqStatus({
          loading: {
            percent: percent,
            label: `${percent}% ${humanFS(e.loadedBytes)} / ${humanFS(
              e.totalBytes
            )}`
          }
        });
      });

      setReqStatus({ result: true });
    } catch (e) {
      setReqStatus({ error: e });
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
            disabled={Boolean(reqStatus.loading)}
            onChange={e => {
              if (e?.target?.files) setFile(e.target.files[0]);
            }}
          />
          <label className="custom-file-label" htmlFor="inputGroupFile01">
            {name ? `${name} (${humanFileSize(size || 0)})` : "Choose file"}
          </label>
        </div>
      </div>

      {/* TO, choose destination path */}
      <Input
        placeholder="Defaults to $WORKDIR/"
        value={toPath}
        onValueChange={setToPath}
        onEnterPress={uploadFile}
        append={
          <Button
            onClick={uploadFile}
            disabled={!file || Boolean(reqStatus.loading)}
            variant="dappnode"
          >
            Upload
          </Button>
        }
      />

      {reqStatus.result && <Ok ok msg="Uploaded file" />}
      {reqStatus.error && <ErrorView error={reqStatus.error} red hideIcon />}
      {reqStatus.loading && (
        <div>
          <ProgressBar
            now={reqStatus.loading.percent || 100}
            animated={true}
            label={reqStatus.loading.label || ""}
          />
        </div>
      )}
    </div>
  );
}
