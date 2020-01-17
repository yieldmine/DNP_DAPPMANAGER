import { dynamicKey } from "./dbCache";
import { joinWithDot, stripDots } from "./dbUtils";

const PACKAGE_GETTING_STARTED_SHOW = "package-getting-started-show";
const PACKAGE_INSTALL_TIME = "package-install-time";

const keyGetterGettingStartedShow = (dnpName: string): string =>
  joinWithDot(PACKAGE_GETTING_STARTED_SHOW, stripDots(dnpName));
const keyGetterInstallTime = (dnpName: string): string =>
  joinWithDot(PACKAGE_INSTALL_TIME, stripDots(dnpName));
const validate = (): boolean => true;

export const packageGettingStartedShow = dynamicKey<boolean, string>(
  keyGetterGettingStartedShow,
  validate
);

export const packageInstallTime = dynamicKey<number, string>(
  keyGetterInstallTime,
  validate
);

export function addPackageInstalledMetadata(dnpName: string): void {
  packageGettingStartedShow.set(dnpName, true);
  packageInstallTime.set(dnpName, Date.now());
}
