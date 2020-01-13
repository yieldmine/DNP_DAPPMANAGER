import { staticKey } from "./dbCache";
import { RawDirectory } from "../watchers/directory/temp-types";
import { RequestStatus } from "../types";

const DIRECTORY_ETHEREUM = "directory-ethereum";
const DIRECTORY_ETHEREUM_STATUS = "directory-ethereum-status";
const DIRECTORY_ZERONET = "directory-zeronet";
const DIRECTORY_ZERONET_STATUS = "directory-zeronet-status";

const emptyDirectory: RawDirectory = {
  timestamp: 0,
  packages: []
};

const emptyRequestStatus: RequestStatus = {};

export const directoryEthereum = staticKey<RawDirectory>(
  DIRECTORY_ETHEREUM,
  emptyDirectory
);

export const directoryEthereumStatus = staticKey<RequestStatus>(
  DIRECTORY_ETHEREUM_STATUS,
  emptyRequestStatus
);

export const directoryZeronet = staticKey<RawDirectory>(
  DIRECTORY_ZERONET,
  emptyDirectory
);

export const directoryZeronetStatus = staticKey<RequestStatus>(
  DIRECTORY_ZERONET_STATUS,
  emptyRequestStatus
);
