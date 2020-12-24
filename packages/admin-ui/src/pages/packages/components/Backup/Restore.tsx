import React, { useState } from "react";
import { confirm } from "components/ConfirmDialog";
// Components
import Button from "components/Button";
import ProgressBar from "react-bootstrap/esm/ProgressBar";
import ErrorView from "components/ErrorView";
// Utils
import humanFS from "utils/humanFileSize";
import { PackageBackup, ReqStatus } from "types";
import { backupUpload } from "api/routes";
import Ok from "components/Ok";

interface ProgressStatus {
  label: string;
  percent?: number;
}

export function BackupRestore({
  dnpName,
  backup
}: {
  dnpName: string;
  backup: PackageBackup[];
}) {
  const [reqStatus, setReqStatus] = useState<ReqStatus<true, ProgressStatus>>(
    {}
  );

  /**
   * Restores a DNP backup given a backup file
   * @param file
   */
  async function restoreBackup(file: File) {
    if (!file) return;

    try {
      await new Promise<void>(resolve => {
        confirm({
          title: `Restoring backup`,
          text: `This action cannot be undone. The backup data will overwrite any previously existing data.`,
          list: [
            {
              title: "Selected file",
              body: `${file.name} (${humanFS(file.size)})`
            }
          ],
          label: "Restore",
          onClick: () => resolve(),
          variant: "dappnode"
        });
      });

      setReqStatus({ loading: { label: "Loading..." } });

      await backupUpload(file, { dnpName }, e => {
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

  // Only render the component if a backup mechanism is provided
  if (!Array.isArray(backup)) return null;

  return (
    <>
      <p>
        Restore an existing backup. Note that this action will overwrite
        existing data.
      </p>

      <Button
        className="button-file-input"
        disabled={Boolean(reqStatus.loading)}
      >
        <span>Restore</span>
        <input
          type="file"
          id="backup_upload"
          name="file"
          accept=".tar, .xz, .tar.xz, .zip"
          disabled={Boolean(reqStatus.loading)}
          onChange={e => {
            if (e.target.files) restoreBackup(e.target.files[0]);
          }}
        />
      </Button>

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
    </>
  );
}
