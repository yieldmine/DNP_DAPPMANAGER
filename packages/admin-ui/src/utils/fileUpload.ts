export type UploadFileProgressHandler = (e: ProgressData) => void;

export interface ProgressData {
  loadedBytes: number;
  totalBytes: number;
  fraction: number;
}

export function uploadSingleFile(
  uploadUrl: string,
  file: File,
  onProgress: UploadFileProgressHandler
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Bind the FormData object and the form element
    const formData = new FormData();
    formData.append("file", file);

    // Define what happens on successful data submission
    // ### Pending bug: .responseText is not typed in XMLHttpRequestEventTarget
    xhr.addEventListener(
      "load",
      e => resolve((e.target as any).responseText),
      false
    );

    // on upload failed
    xhr.addEventListener("error", e => reject((e as any) as Error), false);
    // on upload cancelled
    xhr.addEventListener("abort", e => reject((e as any) as Error), false);

    if (xhr.upload)
      xhr.upload.addEventListener(
        "progress",
        e => onProgress(parseProgress(e)),
        false
      );

    // Set up our request
    xhr.open("POST", uploadUrl, true);
    // The data sent is what the user provided in the form
    xhr.send(formData);
  });
}

function parseProgress(
  e: ProgressEvent<XMLHttpRequestEventTarget>
): ProgressData {
  const loadedBytes = e.loaded || 0;
  const totalBytes = e.total || 0;
  const fraction = (e.loaded || 0) / (e.total || 1);
  return { loadedBytes, totalBytes, fraction };
}
