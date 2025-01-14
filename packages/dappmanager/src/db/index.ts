export * from "./autoUpdateSettings";
export * from "./cache";
export * from "./coreUpdate";
export * from "./dyndns";
export * from "./ethClient";
export * from "./fileTransferPath";
export * from "./network";
export * from "./notification";
export * from "./package";
export * from "./secrets";
export * from "./system";
export * from "./systemFlags";
export * from "./ui";
export * from "./upnp";
export * from "./vpn";
// Aditional low levels methods
import { lowLevel as lowLevelMainDb } from "./dbMain";
import { lowLevel as lowLevelCacheDb } from "./dbCache";
// For migrate
import { AUTO_UPDATE_SETTINGS, autoUpdateSettings } from "./autoUpdateSettings";
import { isEmpty } from "lodash";

/**
 * Migrate keys to the new DB
 */
export function migrateToNewMainDb(): void {
  // AUTO_UPDATE_SETTINGS
  // Migrate ONLY if there are settings in the old DB
  const autoUpdateSettingsValue = lowLevelCacheDb.get(AUTO_UPDATE_SETTINGS);
  if (autoUpdateSettingsValue && !isEmpty(autoUpdateSettingsValue)) {
    autoUpdateSettings.set(autoUpdateSettingsValue);
    lowLevelCacheDb.del(AUTO_UPDATE_SETTINGS);
  }
}

/**
 * Alias, General methods
 */
export const clearCache = lowLevelCacheDb.clearDb;

// Aditional low levels methods
export { lowLevelMainDb, lowLevelCacheDb };
