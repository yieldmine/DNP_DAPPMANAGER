import React, { useState } from "react";
import { BsLock } from "react-icons/bs";
import Alert from "react-bootstrap/esm/Alert";
import Button from "components/Button";
import ErrorView from "components/ErrorView";
import { fetchRecoverPass } from "api/auth";
import { StandaloneContainer } from "./StandaloneContainer";
import { ReqStatus } from "types";
import { InputForm } from "components/InputForm";
import Ok from "components/Ok";
import { recoverPasswordGuideUrl } from "params";

export function ResetPassword({
  onSuccessfulReset
}: {
  onSuccessfulReset: () => void;
}) {
  const [token, setToken] = useState("");
  const [reqStatus, setReqStatus] = useState<ReqStatus>({});

  async function onReset() {
    try {
      setReqStatus({ loading: true });
      await fetchRecoverPass({ token });
      setReqStatus({ result: true });
      onSuccessfulReset();
    } catch (e) {
      setReqStatus({ error: e });
    }
  }

  return (
    <StandaloneContainer TopIcon={BsLock} title="Reset">
      <div className="text">
        Use your recovery token to reset the admin password and register again
      </div>

      <Alert variant="warning">
        If you have lost your recovery token you have to directly access your
        machine via SSH or by connecting a keyboard and screen and follow this
        guide
        <br />
        <a href={recoverPasswordGuideUrl}>
          Reset your DAppNode admin password TODO
        </a>
      </Alert>

      <InputForm
        fields={[
          {
            title: "Recovery token",
            secret: true,
            value: token,
            onValueChange: setToken
          }
        ]}
      />

      <Button
        className="register-button"
        onClick={onReset}
        variant="dappnode"
        disabled={reqStatus.loading || !token}
        fullwidth
      >
        Reset password
      </Button>

      {reqStatus.result && <Ok ok msg="Reseted password"></Ok>}
      {reqStatus.error && <ErrorView error={reqStatus.error} hideIcon red />}
    </StandaloneContainer>
  );
}