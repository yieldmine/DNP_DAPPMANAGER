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
): Promise<void> {
  const extract = tar.extract();

  return new Promise((resolve, reject) => {
    let fileFound = false;

    extract.on("entry", async function(header, stream, next) {
      if (!fileFound && header.name === targetFile && header.type === "file") {
        fileFound = true;

        try {
          await promisify(pipeline)(stream, fileContentSink);
        } catch (e) {
          extract.destroy();
          reject(e);
        } finally {
          next();
        }
      } else {
        // just auto drain the stream, to prevent too much backpressure
        stream.on("end", () => next());
        stream.resume();
      }
    });

    extract.on("finish", function() {
      if (fileFound) resolve();
      else reject(Error(`file ${targetFile} not found in tar`));
    });

    extract.on("error", e => reject(e));

    tarReadableStream.pipe(extract);
  });
}

/**
 * Extracts a single file from a tar stream and returns its contents as buffer
 */
export async function tarExtractSingleFileBuffered(
  tarReadableStream: NodeJS.ReadableStream,
  targetFile: string
): Promise<Buffer> {
  const extract = tar.extract();

  return new Promise((resolve, reject) => {
    let fileBuffer: Buffer | null = null;

    extract.on("entry", async function(header, stream, next) {
      // header is the tar header
      // stream is the content body (might be an empty stream)
      // call next when you are done with this entry

      if (!fileBuffer && header.name === targetFile && header.type === "file") {
        const bufferArr = await all<Buffer>(stream);
        fileBuffer = Buffer.concat(bufferArr);

        next(); // ready for next entry
      } else {
        // just auto drain the stream, to prevent too much backpressure
        stream.on("end", () => next());
        stream.resume();
      }
    });

    extract.on("finish", function() {
      if (fileBuffer) {
        resolve(fileBuffer);
      } else {
        reject(Error(`file ${targetFile} not found in tar`));
      }
    });

    extract.on("error", reject);

    tarReadableStream.pipe(extract);
  });
}

async function all<T>(source: AsyncIterable<T> | Iterable<T>): Promise<T[]> {
  const arr: T[] = [];

  for await (const entry of source) {
    arr.push(entry);
  }

  return arr;
}
