import React from "react";
import RenderMarkdown from "components/RenderMarkdown";
// Components
import Card from "components/Card";
import Button from "components/Button";
import StatusIcon from "components/StatusIcon";
import { shortNameCapitalized } from "utils/format";
import "./permissions.scss";

interface DisclaimerProps {
  disclaimers: { name: string; message: string }[];
  onAccept: () => void;
  goBack: () => void;
}

const Disclaimer: React.FC<DisclaimerProps> = ({
  disclaimers,
  onAccept,
  goBack
}) => {
  /**
   * @param disclaimers = [{
   *   name: "Package disclaimer"
   *   message: "Some markdown text",
   */

  return (
    <Card spacing divider>
      {disclaimers.map(disclaimer => (
        <div key={disclaimer.name}>
          <div className="card-section-header">
            {shortNameCapitalized(disclaimer.name)} disclaimer
          </div>
          <div>
            <RenderMarkdown source={disclaimer.message} />
          </div>
        </div>
      ))}

      {disclaimers.length === 0 && (
        <StatusIcon success message={"Requires no special permissions"} />
      )}

      <div className="button-group">
        <Button onClick={goBack}>Back</Button>
        <Button variant="dappnode" onClick={onAccept}>
          {disclaimers.length === 0 ? "Next" : "Accept"}
        </Button>
      </div>
    </Card>
  );
};

export default Disclaimer;
