import { DirectoryDnpStatus } from "../../types";

export interface RawDirectory {
  timestamp: number;
  packages: RawDirectoryPackage[];
}

export interface RawDirectoryPackage {
  // Dynamic sources
  apm?: string; // "monero.dnp.dappnode.eth",
  zeronet?: string; // "1PRSBRhuoCuocQVmxQZZ84JYDZPMQdqc8E",
  swarm?: string; // "cfb721a7dbed048007b273036068343eac412e77209384f06dd3524b59e03b16",
  // Metadata
  name: string;
  status: DirectoryDnpStatus;
  isFeatured?: boolean;
  isTrusted: boolean;
}

export interface RawRelease {
  // Static sources
  ipfs?: string; // "/ipfs/QmGAHSDJHVASJHDVJ"
  swarm?: string; // "c2a46c7a8c968a746c6c7a89c54ac2a345ca32a3"
  // Metadata
  version: string; // "0.2.4"
  timestamp: string; // Release or update time: 1578905261
  status?: string; // "Deprecated" | "Stable"
}
