import React from "react";
import { CONFIRM_DATA, API_SUCCESS, SEND_RESULT } from "../../../util/constants/componentConstants";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Drag from '@material-ui/icons/AddCircle';

export const BridgekeeperLog = ({ logData }) => (
  <pre className="prettyprint" id="log">
    {logData}
  </pre>
);

export const BridgekeeperRender = function () {
  const { getBridgekeeperInfo, state, updateInput, setConfFile, openInfura } =
    this;
  const {
    loading,
    logData,
    infuraNode,
    bridgeKeeperActive,
    bridgeKeeperStatusAvailable
  } = state;

  return (
    <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}>
      <TextField
        error={false}
        label="Bridgekeeper Status"
        variant="outlined"
        name="status"
        contentEditable={false}
        value={
          loading && !bridgeKeeperStatusAvailable
            ? "Loading..."
            : !bridgeKeeperStatusAvailable
              ? "Unavailable"
              : bridgeKeeperActive
                ? "Running"
                : "Not Running"
        }
        style={{ marginTop: 10, width: "100%" }}
        InputProps={{
          endAdornment: <InputAdornment position="end">
            <IconButton
              aria-label="toggle privatekey visibility"
              edge="end"
              disabled={true}
            >
              {bridgeKeeperStatusAvailable && bridgeKeeperActive ? <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "lime",
                  borderRadius: "50%",
                }}
              ></div> : <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: bridgeKeeperStatusAvailable ? "red" : "gray",
                  borderRadius: "50%",
                }}
              ></div>}
            </IconButton>
          </InputAdornment>
        }}

      />
      <TextField
        error={false}
        label="Enter websocket Endpoint"
        variant="outlined"
        placeholder="wws://[ETH network].infura.io/v3/......"
        onChange={updateInput}
        name="infuraNode"
        value={infuraNode}
        style={{ marginTop: 10, width: "100%" }}
      />
      <Link href="#" onClick={() => {
        openInfura();
      }}>learn more at infura.io.
      </Link>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Button
          variant="outlined"
          onClick={setConfFile}
          disabled={loading}
          size="large"
          color="primary"
          style={{ marginTop: 10 }}
        >
          {"Save Settings"}
        </Button>
        <Button
          variant="outlined"
          onClick={getBridgekeeperInfo}
          disabled={loading}
          size="large"
          color="primary"
          style={{ marginTop: 10 }}
        >
          {"show logs."}
        </Button>
      </div>
      <BridgekeeperLog logData={logData} />
    </div>
  );
};

export const BridgekeeperFormRender = function () {
  const { state, props, getFormData, getContinueDisabled } = this;
  const { modalProps } = props;

  return null;
};
