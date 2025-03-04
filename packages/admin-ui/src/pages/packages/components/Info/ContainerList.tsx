import React, { useState } from "react";
import { packageRestart } from "../../actions";
import {
  StateBadgeDnp,
  StateBadgeContainer,
  StateBadgeLegend
} from "../StateBadge";
import {
  MdRefresh,
  MdPauseCircleOutline,
  MdPlayCircleOutline
} from "react-icons/md";
import { BsChevronExpand, BsChevronContract } from "react-icons/bs";
import { InstalledPackageData, PackageContainer } from "types";
import { withToastNoThrow } from "components/toast/Toast";
import { api } from "api";
import { shortNameCapitalized as sn } from "utils/format";
import { confirm } from "components/ConfirmDialog";
import "./containerList.scss";

export const ContainerList = ({ dnp }: { dnp: InstalledPackageData }) => {
  const [showAll, setShowAll] = useState(false);

  async function onRestart(container?: PackageContainer) {
    packageRestart(dnp, container).catch(console.error);
  }

  async function onStartStop(container?: PackageContainer) {
    const dnpName = dnp.dnpName;
    if (dnpName === "wifi.dnp.dappnode.eth")
      await new Promise<void>(resolve => {
        confirm({
          title: `Disabling Wifi package`,
          text:
            "Warning, if you are connected via WIFI you will lose access to your DAppNode. Make sure to have another way to connect to it before disabling WIFI",
          label: "Disable",
          onClick: resolve
        });
      });

    const serviceNames = container && [container.serviceName];
    const name = container
      ? [sn(dnpName), sn(container.serviceName)].join(" ")
      : sn(dnpName);

    withToastNoThrow(() => api.packageStartStop({ dnpName, serviceNames }), {
      message: `Toggling ${name}...`,
      onSuccess: `Toggled ${name}`
    });
  }

  const allContainersRunning = dnp.containers.every(c => c.running);

  return (
    <div className="info-container-list">
      <div className="list-grid containers">
        <header className="center">Status</header>
        <header></header>
        <header className="center">Pause</header>
        <header className="center">Restart</header>

        {/* DNP entry */}
        <React.Fragment>
          <StateBadgeDnp dnp={dnp} />

          <span className="name">
            {dnp.containers.length > 1 ? (
              <span>All containers</span>
            ) : (
              <span>{sn(dnp.dnpName)}</span>
            )}

            {dnp.containers.length > 1 && (
              <span className="see-all" onClick={() => setShowAll(x => !x)}>
                {showAll ? <BsChevronContract /> : <BsChevronExpand />}
              </span>
            )}
          </span>

          {allContainersRunning ? (
            <MdPauseCircleOutline onClick={() => onStartStop()} />
          ) : (
            <MdPlayCircleOutline onClick={() => onStartStop()} />
          )}

          <MdRefresh onClick={() => onRestart()} />
        </React.Fragment>

        {/* Container display */}
        {showAll &&
          [...dnp.containers]
            .sort((a, b) => a.serviceName.localeCompare(b.serviceName))
            .map(container => (
              <React.Fragment key={container.serviceName}>
                <StateBadgeContainer container={container} />
                <span className="name">{sn(container.serviceName)}</span>
                {container.running ? (
                  <MdPauseCircleOutline
                    onClick={() => onStartStop(container)}
                  />
                ) : (
                  <MdPlayCircleOutline onClick={() => onStartStop(container)} />
                )}
                <MdRefresh onClick={() => onRestart(container)} />
              </React.Fragment>
            ))}
      </div>

      {!showAll && <StateBadgeLegend dnps={[dnp]} />}
    </div>
  );
};
