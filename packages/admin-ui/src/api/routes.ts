import { apiUrls } from "params";
import { UploadFileProgressHandler, uploadSingleFile } from "utils/fileUpload";
import { urlJoin } from "utils/url";

/**
 * Upload a backup file to restore
 */
export async function backupUpload(
  file: File,
  { dnpName }: { dnpName: string },
  onProgress: UploadFileProgressHandler
): Promise<void> {
  const uploadUrl = urlJoin(apiUrls.backupUpload, dnpName);
  await uploadSingleFile(uploadUrl, file, onProgress);
}

/**
 * Get URL to download a specific path with an HTTP GET req
 */
export function backupDownloadUrl({ dnpName }: { dnpName: string }): string {
  return urlJoin(apiUrls.backupDownload, dnpName);
}

/**
 * Upload single file
 */
export async function fileUpload(
  file: File,
  { containerName, path }: { containerName: string; path: string },
  onProgress: UploadFileProgressHandler
): Promise<void> {
  const uploadUrl = urlJoin(apiUrls.fileUpload, containerName, `?path=${path}`);
  await uploadSingleFile(uploadUrl, file, onProgress);
}

/**
 * Get URL to download a specific path with an HTTP GET req
 */
export function fileDownloadUrl({
  containerName,
  path
}: {
  containerName: string;
  path: string;
}): string {
  return urlJoin(apiUrls.fileDownload, containerName, `?path=${path}`);
}

/**
 * Get URL to download logs with an HTTP GET req
 */
export function containerLogsUrl({
  containerName
}: {
  containerName: string;
}): string {
  return urlJoin(apiUrls.containerLogs, containerName);
}

/**
 * Get URL to download all userActionLogs with an HTTP GET req
 */
export function userActionLogsUrl(): string {
  return apiUrls.userActionLogs;
}
