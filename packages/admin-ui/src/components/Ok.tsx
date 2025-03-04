import React from "react";
import { MdCheck, MdClose } from "react-icons/md";
import "./ok.scss";
import "./loader-icon.css";

interface OkProps {
  ok?: boolean;
  loading?: boolean;
  msg: string;
}

const Ok: React.FC<OkProps & React.HTMLAttributes<HTMLDivElement>> = ({
  msg,
  ok,
  loading,
  ...props
}) => {
  return (
    <span className="ok-indicator" {...props}>
      <span className="icon-container">
        {ok ? (
          <MdCheck color="#1ccec0" />
        ) : loading ? (
          <div className="lds-ring">
            <div />
            <div />
            <div />
          </div>
        ) : (
          <MdClose color="#ff0000" />
        )}
      </span>
      <span>{msg}</span>
    </span>
  );
};

export default Ok;
