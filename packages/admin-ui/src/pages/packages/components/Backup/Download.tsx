import React from "react";
// Components
import Button from "components/Button";
import Alert from "react-bootstrap/esm/Alert";
// Utils
import newTabProps from "utils/newTabProps";
import { PackageBackup } from "types";
import { backupDownloadUrl } from "api/routes";

export function BackupDownload({
  dnpName,
  backup
}: {
  dnpName: string;
  backup: PackageBackup[];
}) {
  const downloadUrl = backupDownloadUrl({ dnpName });

  return (
    <>
      <p>
        Download a backup of the critical files of this package in you local
        machine.
      </p>

      <a href={downloadUrl} {...newTabProps} className="no-a-style">
        <Button variant="dappnode">Backup now</Button>
      </a>
      <Alert variant="warning" className="alert-download-sensitive">
        This backup may contain sensitive data such as private keys. Make sure
        to store it safely
      </Alert>
    </>
  );
}
