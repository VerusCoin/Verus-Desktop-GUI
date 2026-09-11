import { InputAdornment, TextField } from '@material-ui/core';
import React from 'react';
import CustomButton from '../../../../containers/CustomButton/CustomButton';
import SuggestionInput from '../../../../containers/SuggestionInput/SuggestionInput';
import WalletPaper from '../../../../containers/WalletPaper/WalletPaper';
import { ADVANCED_CONVERSION, CONFIRM_DATA, CONVERSION_OVERVIEW, ENTER_DATA, SEND_RESULT, SIMPLE_CONVERSION } from '../../../../util/constants/componentConstants';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { secondsToTime } from '../../../../util/displayUtil/timeUtils';
import HelpIcon from '@material-ui/icons/Help';
import * as animationData from '../../../../assets/animations/success.json'
import { Lottie } from '@crello/react-lottie';
import CustomCheckbox from '../../../../containers/CustomCheckbox/CustomCheckbox';
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

export const ConvertCurrencyFormRender = function() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        paddingLeft: 52,
        paddingRight: 52,
      }}
    >
      {this.state.formStep === SEND_RESULT
        ? ConvertCurrencySuccessRender.call(this)
        : this.state.formStep === ENTER_DATA
        ? this.props.mode === SIMPLE_CONVERSION
          ? ConvertCurrencyFormSimpleRender.call(this)
          : ConvertCurrencyFormAdvancedRender.call(this)
        : this.props.mode === ADVANCED_CONVERSION
        ? ConvertCurrencyFormAdvancedRender.call(this)
        : ConvertCurrencyConfirmSimpleRender.call(this)}
    </div>
  );
}

export const ConvertCurrencySuccessRender = function() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          paddingBottom: 56,
          flex: 1
        }}
      >
        <Lottie
          config={{animationData: animationData.default, loop: false}}
          width="20%"
          height="30%"
        />
        <h4 style={{ color: "rgb(74, 166, 88)", fontWeight: "bold" }}>{"Transaction posted!"}</h4>
        <h4>{"Track it under the overview tab."}</h4>
      </div>
      <div>
        <div
          style={{
            display: "flex",
          }}
        >
          <CustomButton
            title={"Back"}
            backgroundColor={"rgb(212, 49, 62)"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              style: { height: 58, flex: 1, marginRight: 4 },
              flex: 1,
            }}
            onClick={this.resetState}
          />
          <CustomButton
            title={"Overview"}
            backgroundColor={"rgb(49, 101, 212)"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              style: { height: 58, flex: 1, marginLeft: 4 },
            }}
            onClick={() => this.props.setSelectedMode(CONVERSION_OVERVIEW)}
          />
        </div>
      </div>
    </div>
  );
}

export const ConvertCurrencyConfirmSimpleRender = function() {
  const { selectedConversionPath, conversionPaths, confirmOutputIndex, outputs, fetchingFee, feeEstimate } = this.state;

  const output = outputs[confirmOutputIndex];
  const price = conversionPaths[selectedConversionPath]
    ? conversionPaths[selectedConversionPath].price
    : 0;

  const fee = output.via
    ? Number((0.0005 * output.amount + (output.exportto ? 0.0201 : 0.0001)).toFixed(8))
    : Number((0.00025 * output.amount + (output.exportto ? 0.0201 : 0.0001)).toFixed(8));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        <TextField
          style={{
            flex: 1,
            marginRight: 4,
          }}
          label="From"
          variant="outlined"
          value={output.currency}
          InputProps={{
            readOnly: true,
          }}
        />
        {output.via && (
          <TextField
            style={{
              flex: 1,
              marginRight: 4,
              marginLeft: 4,
            }}
            label="Via"
            variant="outlined"
            value={
              conversionPaths[selectedConversionPath]
                ? conversionPaths[selectedConversionPath].via.fullyqualifiedname
                : output.via
            }
            InputProps={{
              readOnly: true,
            }}
          />
        )}
        <TextField
          style={{
            flex: 1,
            marginLeft: 4,
          }}
          label="To"
          variant="outlined"
          value={
            conversionPaths[selectedConversionPath]
              ? conversionPaths[selectedConversionPath].destination.fullyqualifiedname
              : output.convertto
          }
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        <TextField
          style={{
            flex: 1,
            marginRight: 4,
          }}
          label="Estimated Conversion Fee"
          variant="outlined"
          value={`${
            output.amount != null
              ? output.via
                ? Number((0.0005 * output.amount).toFixed(8))
                : Number((0.00025 * output.amount).toFixed(8))
              : "-"
          } ${output.currency ? output.currency : "-"}`}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          style={{
            flex: 1,
            marginLeft: 4,
          }}
          label="Estimated Network Fee"
          variant="outlined"
          value={`${fetchingFee ?
              "Loading..."
              :
              feeEstimate == null ?
                "-"
                :
                Number((feeEstimate).toFixed(8))
            } ${this.props.modalProps.chainTicker}`}
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        <TextField
          style={{
            flex: 1,
            marginRight: 4,
          }}
          label="Send"
          variant="outlined"
          value={`${output.amount} ${output.currency}`}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          style={{
            flex: 1,
            marginLeft: 4,
          }}
          label="Receive (Estimated)"
          variant="outlined"
          value={`${this.state.conversionEstimate == null ? "Unknown" : this.state.conversionEstimate.estimatedcurrencyout} ${
            conversionPaths[selectedConversionPath]
              ? conversionPaths[selectedConversionPath].destination.fullyqualifiedname
              : output.convertto
          }`}
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        <TextField
          style={{
            flex: 1,
            marginRight: 4,
          }}
          label="Destination Address"
          variant="outlined"
          value={output.address}
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
      <div>
        <div
          style={{
            display: "flex",
          }}
        >
          <CustomButton
            title={"Back"}
            backgroundColor={"rgb(212, 49, 62)"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              style: { height: 58, flex: 1, marginRight: 4 },
              flex: 1,
            }}
            onClick={() => this.setFormStep(ENTER_DATA)}
          />
          <CustomButton
            title={"Confirm"}
            backgroundColor={"rgb(49, 101, 212)"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              style: { height: 58, flex: 1, marginLeft: 4 },
            }}
            onClick={this.confirmSend}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "rgb(149, 149, 149)",
            marginTop: 8,
          }}
        >
          <ErrorOutlineIcon style={{ marginRight: 8, marginLeft: 8 }} />
          <div style={{ fontSize: 14 }}>
            {
              "Estimated price may vary from actual price, due to all conversions being bundled at block boundaries and solved simultaneously."
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConvertCurrencyFormSimpleOptionText = function (conversionPath) {
  const { via, destination } = conversionPath;
  const destLabel = destination.fullyqualifiedname ? destination.fullyqualifiedname : destination.name
  const viaLabel = via == null ? null : via.fullyqualifiedname ? via.fullyqualifiedname : via.name

  return `${destLabel}${conversionPath.via
      ? ` (${conversionPath.exportto ? (conversionPath.gateway ? `to ${conversionPath.exportto.name} network ` : `to ${conversionPath.exportto.name} network `) : ""
      }via ${viaLabel})`
      : conversionPath.exportto
        ? conversionPath.gateway
          ? ` (to ${conversionPath.exportto.name} network)`
          : ` (to ${conversionPath.exportto.name} network)`
        : ""
    }`;
};

export const ConvertCurrencyFormSimpleRender = function() {
  const {
    currency,
    amount,
    convertto,
    address,
    via,
    sendAmount,
    exportto,
    refundto
  } = this.state.outputs[0];
  const price = this.state.conversionPaths[this.state.selectedConversionPath]
    ? this.state.conversionPaths[this.state.selectedConversionPath].price
    : 0;
  const destination = this.state.conversionPaths[
    this.state.selectedConversionPath
  ]
    ? this.state.conversionPaths[this.state.selectedConversionPath].destination
    : null;
  
  const whitelist = this.props.whitelists[this.props.activeCoin.id]
    ? this.props.whitelists[this.props.activeCoin.id]
    : [];
  const sources = whitelist.includes(
    this.props.modalProps.chainTicker
  )
    ? whitelist
    : [this.props.modalProps.chainTicker, ...whitelist];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        height: "100%",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
        }}
      >
        <WalletPaper
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
          square={false}
        >
          <h5
            style={{
              fontWeight: "bold",
              color: "rgb(212, 49, 62)",
              fontSize: 18,
            }}
          >
            {"Send"}
          </h5>
          <div>{`My Balance: ${
            currency != null && this.props.balances != null
              ? currency == this.props.modalProps.chainTicker
                ? this.props.balances.native.public.confirmed
                : this.props.balances.reserve[currency]
                ? this.props.balances.reserve[currency].public.confirmed
                : "0"
              : "-"
          }`}</div>
          <div style={{ display: "flex", marginTop: 8 }}>
            <TextField
              label="Amount"
              variant="outlined"
              size="small"
              onChange={(e) => this.updateSimpleFormAmount(e, true)}
              value={sendAmount}
              style={{ flex: 1, marginRight: 4 }}
            />
            <SuggestionInput
              value={currency}
              name="SendingCurrency"
              items={sources}
              label="Currency"
              size="small"
              grouped={false}
              freeSolo={false}
              onChange={(e) => {
                if (e.target.value != null && e.target.value.length > 0) {
                  this.selectSimpleSourceCurrency(e.target.value);
                }
              }}
              containerStyle={{ flex: 2 }}
            />
          </div>
        </WalletPaper>
        <WalletPaper
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            marginTop: 8,
          }}
          square={false}
        >
          <h5
            style={{
              fontWeight: "bold",
              color: "rgb(74, 166, 88)",
              fontSize: 18,
            }}
          >
            {"Receive"}
          </h5>
          <div>{`My Balance: ${
            destination != null && this.props.balances != null
              ? destination.name == this.props.chainTicker
                ? this.props.balances.native.public.confirmed
                : this.props.balances.reserve[destination.name]
                ? this.props.balances.reserve[destination.name].public.confirmed
                : "0"
              : "-"
          }`}</div>
          <div style={{ display: "flex", marginTop: 8 }}>
            <TextField
              label="Est. amount"
              variant="outlined"
              size="small"
              disabled={true}
              value={
                this.state.fetchingEstimate ? "Loading..." : this.state.conversionEstimate == null ? "" : this.state.conversionEstimate.estimatedcurrencyout
              }
              style={{ flex: 1, marginRight: 4 }}
            />
            <SuggestionInput
              value={
                this.state.conversionPaths[this.state.selectedConversionPath]
                  ? ConvertCurrencyFormSimpleOptionText(
                      this.state.conversionPaths[this.state.selectedConversionPath]
                    )
                  : null
              }
              name="RecievingCurrency"
              items={this.state.conversionPaths
                .map((x, index) => index)
                .sort((a, b) => {
                  return this.state.conversionPaths[a].destination.name.localeCompare(
                    this.state.conversionPaths[b].destination.name
                  );
                })}
              label={'Currency'}
              size="small"
              grouped={false}
              freeSolo={false}
              onChange={(e) => this.selectConversionPath(e.target.value === "" ? null : e.target.value)}
              disabled={this.state.conversionPaths.length == 0}
              renderOption={(option) => {
                return (
                  <h1
                    className="d-lg-flex align-items-lg-center"
                    style={{ marginBottom: 0, fontSize: 16 }}
                  >
                    {ConvertCurrencyFormSimpleOptionText(this.state.conversionPaths[option])}
                  </h1>
                );
              }}
              containerStyle={{ flex: 2 }}
              filterOptions={(options, state) => {
                const input = state.inputValue.toUpperCase();

                return options.filter((pathIndex) => {
                  const name = this.state.conversionPaths[pathIndex].destination.name.toUpperCase();

                  return name.includes(input);
                });
              }}
            />
          </div>
          <div style={{ display: "flex", marginTop: 8 }}>
            <SuggestionInput
              value={address}
              name="DestinationAddress"
              items={exportto != null && exportto.length > 0 ? [] : this.state.addresses}
              label={'Destination'}
              size="small"
              grouped={false}
              freeSolo={true}
              onChange={(e) => this.updateOutput("address", e.target.value)}
              containerStyle={{ flex: 1 }}
            />
            {this.state.estArrivals[0] && (
              <TextField
                style={{
                  flex: 1,
                  marginLeft: 4,
                }}
                label="Est. Arrival"
                variant="outlined"
                value={secondsToTime(this.state.estArrivals[0] * 60)}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          'This currency is in its "preconvert" phase and has not launched yet. If you convert to it, your funds will either arrive (when the currency launches successfully) or be refunded to the destination address (if the currency launch fails).'
                        }
                      >
                        <HelpIcon color="primary" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </div>
          {(exportto != null && exportto.length > 0) && (
            <div style={{ display: "flex", marginTop: 8 }}>
              <SuggestionInput
                value={refundto}
                name="RefundAddress"
                items={this.state.addresses}
                label={'Refund Address'}
                size="small"
                grouped={false}
                freeSolo={true}
                onChange={(e) => this.updateOutput("refundto", e.target.value)}
                containerStyle={{ flex: 1 }}
              />
            </div>
          )}
        </WalletPaper>
      </div>
      <div>
        <div style={{ display: "flex" }}>
          <WalletPaper
            style={{
              marginBottom: 8,
              flex: 1,
              marginRight: 4,
            }}
            square={false}
          >
            <div style={{ fontWeight: "bold" }}>{`Est. conversion fee: ${
              amount
                ? via
                  ? Number((0.0005 * amount).toFixed(8))
                  : Number((0.00025 * amount).toFixed(8))
                : "-"
            } ${currency ? currency : "-"}`}</div>
          </WalletPaper>
          <WalletPaper
            style={{
              marginBottom: 8,
              flex: 1,
              marginLeft: 4,
            }}
            square={false}
          >
            <div style={{ fontWeight: "bold" }}>{`Est. network fee: ${
              this.state.fetchingFee ? 
                "Loading..." 
                : 
                this.state.feeEstimate == null ? 
                  "-" 
                  : 
                  Number((this.state.feeEstimate).toFixed(8))
            } ${this.props.modalProps.chainTicker}`}</div>
          </WalletPaper>
        </div>
        <div style={{ display: "flex" }}>
          <WalletPaper
            style={{
              marginBottom: 8,
              flex: 1,
              marginRight: 4,
            }}
            square={false}
          >
            <div style={{ fontWeight: "bold" }}>{`Est. price per ${currency ? currency : "-"}: ${
              this.state.fetchingEstimate ? 
                "Loading..." 
                : 
                this.state.conversionEstimate == null ? 
                  "-" 
                  : 
                  Number((this.state.conversionEstimate.estimatedcurrencyout / this.state.conversionEstimate.netinputamount).toFixed(8))
            }`}</div>
          </WalletPaper>
          <WalletPaper
            style={{
              marginBottom: 8,
              marginLeft: 4,
              flex: 1,
            }}
            square={false}
          >
            <div style={{ fontWeight: "bold" }}>{`Est. time: ${
              this.state.selectedConversionPath != null
                ? exportto
                  ? "60-120 Min."
                  : "2-10 Min."
                : "- Min."
            }`}</div>
          </WalletPaper>
        </div>
        <CustomButton
          title={"Convert currencies"}
          backgroundColor={"rgb(49, 101, 212)"}
          textColor={"white"}
          buttonProps={{
            size: "large",
            color: "default",
            style: { width: "100%", height: 58 },
          }}
          onClick={() => this.setFormStep(CONFIRM_DATA)}
          disabled={
            currency == null ||
            convertto == null ||
            amount === 0 ||
            address == null ||
            address.length === 0
          }
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "rgb(149, 149, 149)",
            marginTop: 8,
          }}
        >
          <ErrorOutlineIcon style={{ marginRight: 8, marginLeft: 8 }} />
          <div style={{ fontSize: 14 }}>
            {
              "Estimated price may vary from actual price, due to all conversions being bundled at block boundaries and solved simultaneously. The estimated fee does not currently take into account cross-chain fees (only relevant when sending off-chain or off-system), which may be significant. Fees will be more accurately estimated in a future update."
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConvertCurrencyFormAdvancedRender = function() {
  const isConfirmStep = this.state.formStep === CONFIRM_DATA

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
          maxHeight: 400,
          overflow: "scroll",
        }}
      >
        {this.state.outputs.map((output, index) => {
          const {
            currency,
            amount,
            convertto,
            address,
            via,
            preconvert,
            refundto,
            memo,
            sendAmount,
            exportto
          } = output;

          return (
            <WalletPaper
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                marginTop: index === 0 ? 0 : 32,
                minHeight: "min-content",
              }}
              square={false}
              key={index}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                  }}
                >
                  {`Output ${index + 1}`}
                </h5>
                {this.state.outputs.length > 1 && !isConfirmStep && (
                  <IconButton
                    aria-label={`Remove Output ${index + 1}`}
                    onClick={() => this.removeOutput(index)}
                    size="small"
                    style={{
                      color: "black",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Amount"
                  variant="outlined"
                  size="small"
                  onChange={(e) => this.updateAdvancedFormAmount(e, index)}
                  value={
                    isConfirmStep
                      ? amount
                      : sendAmount == null
                      ? ""
                      : sendAmount
                  }
                  style={{ flex: 1, marginRight: 4 }}
                  disabled={isConfirmStep}
                />
                <TextField
                  label="From Currency"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("currency", e.target.value, index)
                  }
                  value={currency}
                  style={{ flex: 1, marginRight: 4 }}
                  disabled={isConfirmStep}
                />
                <TextField
                  label="To Currency"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("convertto", e.target.value, index)
                  }
                  value={convertto}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Via Currency (if required)"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("via", e.target.value, index)
                  }
                  value={via}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Destination System (if required)"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("exportto", e.target.value, index)
                  }
                  value={exportto}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Destination Address"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("address", e.target.value, index)
                  }
                  value={address}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <div
                  className="form-check d-flex align-items-center"
                  style={{ padding: 0 }}
                >
                  <CustomCheckbox
                    colorChecked={"#3165D4"}
                    colorUnchecked={"#3165D4"}
                    checkboxProps={{
                      disabled: isConfirmStep,
                      checked: preconvert,
                      onChange: (e) => {
                        this.updateOutput(
                          "preconvert",
                          e.target.checked,
                          index
                        );
                      },
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="formCheck-1"
                    style={{ color: "rgb(0,0,0)" }}
                  >
                    {"Send as pre-convert"}
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Refund Address"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("refundto", e.target.value, index)
                  }
                  value={refundto}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
              <div style={{ display: "flex", marginTop: 8 }}>
                <TextField
                  label="Memo"
                  variant="outlined"
                  size="small"
                  onChange={(e) =>
                    this.updateOutput("memo", e.target.value, index)
                  }
                  value={memo}
                  style={{ flex: 1 }}
                  disabled={isConfirmStep}
                />
              </div>
            </WalletPaper>
          );
        })}
        <div ref={(el) => { this.outputsEnd = el; }} />
      </div>
      <div style={{ display: "flex" }}>
        {!isConfirmStep && (
          <CustomButton
            title={"Add output"}
            backgroundColor={"rgb(49, 101, 212)"}
            textColor={"white"}
            style={{
              marginRight: 8,
            }}
            buttonProps={{
              size: "large",
              color: "default",
              style: { width: "100%", height: 58 },
            }}
            onClick={this.addOutput}
          />
        )}
        {isConfirmStep && (
          <CustomButton
            title={"Back"}
            backgroundColor={"rgb(212, 49, 62)"}
            textColor={"white"}
            style={{
              marginRight: 8,
            }}
            buttonProps={{
              size: "large",
              color: "default",
              style: { width: "100%", height: 58 },
            }}
            onClick={() => this.setFormStep(ENTER_DATA)}
          />
        )}
        <CustomButton
          title={isConfirmStep ? "Confirm" : "Convert currencies"}
          backgroundColor={"rgb(49, 101, 212)"}
          textColor={"white"}
          disabled={this.state.loading || !this.hasValidAmounts()}
          buttonProps={{
            size: "large",
            color: "default",
            style: { width: "100%", height: 58 },
          }}
          onClick={() => {
            if (isConfirmStep) this.confirmSend()
            else this.setFormStep(CONFIRM_DATA)
          }}
        />
      </div>
    </div>
  );
};
