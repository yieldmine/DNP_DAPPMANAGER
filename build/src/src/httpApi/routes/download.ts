import express from "express";
import fs from "fs";
import * as db from "../../db";
import Logs from "../../logs";
const logs = Logs(module);

/**
 * Endpoint to download files.
 * File must be previously available at the specified fileId
 */
export const download: express.Handler = async (req, res) => {
  const { fileId } = req.params;
  const filePath = db.fileTransferPath.get(fileId);

  // If path does not exist, return error
  if (!filePath) return res.status(404).send("File not found");

  // Remove the fileId from the DB FIRST to prevent reply attacks
  db.fileTransferPath.remove(fileId);
  return res.download(filePath, errHttp => {
    if (!errHttp)
      fs.unlink(filePath, errFs => {
        if (errFs) logs.error(`Error deleting file: ${errFs.message}`);
      });
  });
};