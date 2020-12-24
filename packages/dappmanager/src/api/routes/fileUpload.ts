import Busboy from "busboy";
import tar from "tar-stream";
import { wrapHandler } from "../utils";
import { dockerPutArchive } from "../../modules/docker/api/putArchive";

const fileFieldname = "file";

interface Params {
  containerName: string;
}

/**
 * Endpoint to upload files.
 */
export const fileUpload = wrapHandler<Params>(async (req, res) => {
  const containerNameOrId = req.params.containerName;
  const rootTarPath = (req.query.path as string) || "/";

  for await (const chunk of req) {
    console.log({ chunk });
  }

  // Busboy must consume each file stream before going to the next
  // On each file either consume or add to the tar pack
  // Once the form is finished, mark the tar file as finished
  const busboy = new Busboy({ headers: req.headers });
  const pack = tar.pack();

  // Listen for event when Busboy finds a file to stream.
  busboy.on("file", (fieldname, file, filename) => {
    if (fieldname === fileFieldname) {
      console.log({ filename });
      pack.entry({ name: filename }, Buffer.from("hhehehe"));
      file.resume();
    } else {
      file.resume();
    }
  });

  busboy.on("finish", () => {
    console.log("Done!");
    pack.finalize();
  });

  busboy.on("error", (err: Error) => {
    pack.destroy(err);
  });

  // Pipe the HTTP Request into Busboy.
  req.pipe(busboy);

  await dockerPutArchive(containerNameOrId, rootTarPath, pack, {
    noOverwriteDirNonDir: true
  });
});
