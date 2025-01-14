import * as dbMain from "./dbMain";
import * as dbCache from "./dbCache";
import { DiskUsageThresholds, PackageVersionData } from "../types";
import { joinWithDot } from "./dbUtils";

const SERVER_NAME = "server-name";
const FULLNODE_DOMAIN_TARGET = "fullnode-domain-target";
const PASSWORD_IS_SECURE = "password-is-secure";
const VERSION_DATA = "version-data";
const TELEGRAM_STATUS = "telegram-status";
const TELEGRAM_TOKEN = "telegram-token";
const TELEGRAM_CHANNEL_ID = "telegram-channel-id";
const DISK_USAGE_THRESHOLD = "disk-usage-threshold";

export const serverName = dbMain.staticKey<string>(SERVER_NAME, "");

// Domains

export const fullnodeDomainTarget = dbMain.staticKey<string>(
  FULLNODE_DOMAIN_TARGET,
  ""
);

// Host password check

export const passwordIsSecure = dbMain.staticKey<boolean>(
  PASSWORD_IS_SECURE,
  false
);

// Telegram bot status

export const telegramStatus = dbMain.staticKey<boolean>(TELEGRAM_STATUS, false);

// Telegram token

export const telegramToken = dbMain.staticKey<string | null>(
  TELEGRAM_TOKEN,
  null
);

// Telegram channel Id

export const telegramChannelIds = dbMain.staticKey<string[]>(
  TELEGRAM_CHANNEL_ID,
  []
);

// Cache version information to detect updates

export const versionData = dbCache.staticKey<PackageVersionData>(
  VERSION_DATA,
  {}
);

// Disk usage threshould records

export const diskUsageThreshold = dbCache.dynamicKeyValidate<boolean, string>(
  id => joinWithDot(DISK_USAGE_THRESHOLD, id),
  () => true
);
