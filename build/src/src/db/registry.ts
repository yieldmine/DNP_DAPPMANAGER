import * as cache from "./dbCache";
import { RawDirectory } from "../watchers/directory/temp-types";
import { joinWithDot, validateIsObject } from "./dbUtils";
import { RequestStatus } from "../types";

const REGISTRY = "registry";
const REGISTRY_REQUEST_STATUS = "registry-request-status";

const registryKeyGetter = (id: string): string => joinWithDot(REGISTRY, id);

export const registry = cache.dynamicKey<RawDirectory, string>(
  registryKeyGetter,
  validateIsObject
);

interface Registries {
  [registryId: string]: RawDirectory;
}

/**
 * To fetch all registries as an object
 */
export const registries = cache.staticKey<Registries>(REGISTRY, {});

/**
 * Store the request status for each registry
 */

const registryRequestStatusKeyGetter = (id: string): string =>
  joinWithDot(REGISTRY_REQUEST_STATUS, id);
cache;

export const registryRequestStatus = cache.dynamicKey<RequestStatus, string>(
  registryRequestStatusKeyGetter,
  validateIsObject
);
