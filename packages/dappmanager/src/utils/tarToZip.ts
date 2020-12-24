import tar from "tar-stream";
import { promisify } from "util";
import { Writable, pipeline } from "stream";

/**
 * Extracts a single file from a tar stream and pipes its contents
 * to a Writable stream
 */
export async function tarExtractSingleFile(
  tarReadableStream: NodeJS.ReadableStream,
  fileContentSink: Writable,
  targetFile: string
): Promise<void> {}
