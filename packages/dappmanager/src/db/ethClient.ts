import * as dbMain from "./dbMain";
import * as dbCache from "./dbCache";
import {
  EthClientTarget,
  UserSettings,
  EthClientFallback,
  EthClientStatus,
  EthClientTargetPackage,
  EthClientSyncedNotificationStatus
} from "../types";
import { joinWithDot } from "./dbUtils";
import { EthClientInstallStatus } from "../modules/ethClient/types";
import { eventBus } from "../eventBus";

// User chosen properties
const ETH_CLIENT_TARGET = "eth-client-target";
const ETH_CLIENT_FALLBACK = "eth-client-fallback";
const ETH_CLIENT_USER_SETTINGS = "eth-client-user-settings";
// Cached status
const ETH_CLIENT_INSTALL_STATUS = "eth-client-install-status";
const ETH_CLIENT_STATUS = "eth-client-status";
const ETH_PROVIDER_URL = "eth-provider-url";
// Cached temp status
const ETH_CLIENT_MIGRATION_TEMP_SETTINGS = "eth-client-migration-temp-status";
const ETH_CLIENT_SYNCED_NOTIFICATION_STATUS =
  "eth-client-synced-notification-status";

// Re-export to consider the first value (when it's not set)
// but do not allow to set null again. Using to express intentionality
const _ethClientTarget = interceptOnSet(
  dbMain.staticKey<EthClientTarget | null>(ETH_CLIENT_TARGET, null)
);
export const ethClientTarget = {
  get: _ethClientTarget.get,
  set: (newValue: EthClientTarget): void => _ethClientTarget.set(newValue)
};

export const ethClientFallback = interceptOnSet(
  dbMain.staticKey<EthClientFallback>(ETH_CLIENT_FALLBACK, "off")
);

// Persist the user settings of each client
// This is necessary if there was a migration and the settings have to
// be kept after switching between clients

const ethClientUserSettingsKeyGetter = (target: EthClientTarget): string =>
  joinWithDot(ETH_CLIENT_USER_SETTINGS, target);
const ethClientUserSettingsValidate = (
  id: string,
  userSettings?: UserSettings
): boolean => typeof id === "string" && typeof userSettings === "object";

export const ethClientUserSettings = dbMain.dynamicKeyValidate<
  UserSettings,
  EthClientTarget
>(ethClientUserSettingsKeyGetter, ethClientUserSettingsValidate);

// Cached status, not critical

/**
 * Cache the status of the eth client install loop
 */
export const ethClientInstallStatus = interceptOnSet(
  dbCache.dynamicKeyValidate<EthClientInstallStatus, EthClientTarget>(
    (target: EthClientTarget): string =>
      joinWithDot(ETH_CLIENT_INSTALL_STATUS, target),
    (id: string, installStatus?: EthClientInstallStatus): boolean =>
      typeof id === "string" && typeof installStatus === "object"
  )
);

/**
 * Cache the general status of the eth client, if it's available or not
 */
export const ethClientStatus = interceptOnSet(
  dbCache.dynamicKeyValidate<EthClientStatus, EthClientTarget>(
    (target: EthClientTarget): string => joinWithDot(ETH_CLIENT_STATUS, target),
    (id: string, status?: EthClientStatus): boolean =>
      typeof id === "string" && typeof status === "object"
  )
);

export const ethProviderUrl = interceptOnSet(
  dbCache.staticKey<string>(ETH_PROVIDER_URL, "")
);

/**
 * Intercept all on set methods to request an update to the UI
 * @param dbSetter
 */
function interceptOnSet<F extends Function, T extends { set: F }>(
  dbSetter: T
): T {
  return {
    ...dbSetter,
    // Arguments are not used, so their type is not relevant
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    set: function(...args: any[]): void {
      dbSetter.set(...args);
      eventBus.requestSystemInfo.emit();
    }
  };
}

/**
 * Temporal cache settings that must survive a reset
 * Store settings in the cache. It is possible that the migration is stopped
 * because the DAPPMANAGER resets and then the eth client will not be installed
 */
export const ethClientMigrationTempSettings = dbCache.staticKey<{
  target: EthClientTargetPackage;
  EXTRA_OPTS: string;
} | null>(ETH_CLIENT_MIGRATION_TEMP_SETTINGS, null);

/**
 * Cache the status of the eth client install loop
 */
export const ethClientSyncedNotificationStatus = dbCache.staticKey<
  EthClientSyncedNotificationStatus
>(ETH_CLIENT_SYNCED_NOTIFICATION_STATUS, null);
