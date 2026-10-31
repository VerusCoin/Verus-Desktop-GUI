import React from 'react';
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { FormControlLabel } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ObjectToTable from '../../../../containers/ObjectToTable/ObjectToTable'
import CustomCheckbox from '../../../../containers/CustomCheckbox/CustomCheckbox';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import {
  ENTER_DATA,
  CONFIRM_DATA,
  GIFT_CARD_FUNDING_FUNDS,
  GIFT_CARD_FUNDING_IDENTITY,
  GIFT_CARD_FUNDING_BOTH
} from '../../../../util/constants/componentConstants';

export const FundGiftCardFormRender = function() {
  const { formStep, giftCard } = this.props

  return (
    <div
      className="col-xs-12 backround-gray"
      style={{
        width: "100%",
        height: "85%",
        display: "flex",
        justifyContent: formStep === ENTER_DATA ? "flex-start" : "center",
        alignItems: formStep === ENTER_DATA ? "flex-start" : "unset",
        marginBottom: formStep === ENTER_DATA ? 0 : 20,
        flexDirection: "column",
        overflowY: "scroll"
      }}
    >
      {giftCard == null
        ? "Gift card is no longer available."
        : formStep === ENTER_DATA
        ? FundGiftCardFormEnterRender.call(this)
        : FundGiftCardTxDataRender.call(this)}
    </div>
  );
}

export const FundGiftCardWarningRender = function(title, text, items) {
  return (
    <div
      key={title}
      style={{
        backgroundColor: "rgb(255,244,232)",
        border: "1px solid rgb(236,124,43)",
        borderRadius: 8,
        marginBottom: 10,
        padding: 10,
        width: "100%"
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        <i className="fas fa-exclamation-triangle" style={{ paddingRight: 6, color: "rgb(236,124,43)" }} />
        {title}
      </div>
      <div style={{ fontSize: 12, marginTop: 6 }}>{text}</div>
      {items.map((item, index) => (
        <div key={index} style={{ fontSize: 12, marginTop: 4, overflowWrap: "anywhere" }}>{item}</div>
      ))}
    </div>
  )
}

export const FundGiftCardTxDataRender = function() {
  const { formStep, txData } = this.props
  const result = txData.result || {}
  const heldFundIdentities =
    formStep === CONFIRM_DATA
      ? (result.identities || []).filter(identity => (identity.currencies || []).length > 0)
      : []

  return (
    <React.Fragment>
      {formStep === CONFIRM_DATA && (
        <h6 style={{ fontSize: 16, fontWeight: "bold", color: "rgb(0,0,0)" }}>{"Review funding"}</h6>
      )}
      {heldFundIdentities.length > 0 &&
        FundGiftCardWarningRender(
          "Selected VerusIDs already hold funds",
          "These funds will move with the VerusID when it is transferred to the gift card.",
          heldFundIdentities.map(
            identity =>
              `${identity.fullyQualifiedName || identity.identityAddress}: ${identity.currencies
                .map(({ currency, amount }) => `${amount} ${currency}`)
                .join(", ")}`
          )
        )}
      <ObjectToTable
        dataObj={this.state.txDataDisplay}
        pagination={false}
        paperStyle={{ width: "100%" }}
      />
    </React.Fragment>
  )
}

export const FundGiftCardFormEnterRender = function() {
  const {
    state,
    props,
    updateInput,
    setMode,
    updateFundAmount,
    setFundAmountMax,
    toggleIdentity,
    copyAddressAndExit
  } = this
  const { mode, fundAmounts, selectedIds, password, formErrors } = state
  const { giftCard } = props
  const fundingIdentities = this.getFundingIdentities()

  return (
    <React.Fragment>
      <div style={{ fontSize: 16, fontWeight: "bold", color: "rgb(49, 101, 212)" }}>
        {giftCard.label}
      </div>
      <FormControl component="fieldset" style={{ width: "100%", marginTop: 10 }}>
        <FormLabel component="legend" style={{ fontSize: 14, color: "rgb(0,0,0)" }}>
          {"What should this gift card hold?"}
        </FormLabel>
        <RadioGroup row value={mode} onChange={setMode}>
          <FormControlLabel value={GIFT_CARD_FUNDING_FUNDS} control={<Radio color="primary" />} label="Funds only" />
          <FormControlLabel value={GIFT_CARD_FUNDING_IDENTITY} control={<Radio color="primary" />} label="VerusID" />
          <FormControlLabel value={GIFT_CARD_FUNDING_BOTH} control={<Radio color="primary" />} label="Funds and VerusID" />
        </RadioGroup>
      </FormControl>
      <Button
        color="primary"
        startIcon={<FileCopyIcon />}
        onClick={copyAddressAndExit}
        style={{ marginTop: 5 }}
      >
        {"Copy address and fund externally"}
      </Button>
      {mode !== GIFT_CARD_FUNDING_IDENTITY && (
        <React.Fragment>
          <h6 style={{ fontSize: 14, fontWeight: "bold", color: "rgb(0,0,0)", marginTop: 10 }}>
            {"Choose funds"}
          </h6>
          {this.getFundingCurrencies().map(({ currency, balance }) => (
            <div
              key={currency}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
            >
              <div style={{ paddingRight: 12, color: "rgb(0,0,0)" }}>
                <div style={{ fontWeight: "bold" }}>{currency}</div>
                <div style={{ fontSize: 12 }}>{`Balance: ${balance == null ? "-" : balance} ${currency}`}</div>
              </div>
              <TextField
                error={formErrors.fundAmounts[currency] != null}
                helperText={formErrors.fundAmounts[currency]}
                label="Amount"
                variant="outlined"
                type="number"
                value={fundAmounts[currency] != null ? fundAmounts[currency] : ""}
                onChange={e => updateFundAmount(currency, e.target.value)}
                style={{ marginTop: 5, width: "50%" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        disabled={balance == null}
                        onClick={() => setFundAmountMax(currency, balance)}
                      >
                        {"Max"}
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </div>
          ))}
        </React.Fragment>
      )}
      {mode !== GIFT_CARD_FUNDING_FUNDS && (
        <React.Fragment>
          <h6 style={{ fontSize: 14, fontWeight: "bold", color: "rgb(0,0,0)", marginTop: 10 }}>
            {"Choose VerusIDs"}
          </h6>
          {fundingIdentities.length === 0 ? (
            <div style={{ color: "rgb(0,0,0)" }}>{"No VerusIDs are available for this gift card."}</div>
          ) : (
            fundingIdentities.map(identity => (
              <FormControlLabel
                key={identity.identityAddress}
                control={
                  <CustomCheckbox
                    checkboxProps={{
                      checked: selectedIds[identity.identityAddress] === true,
                      onChange: () => toggleIdentity(identity.identityAddress),
                    }}
                    colorChecked="rgb(49, 101, 212)"
                    colorUnchecked="rgb(49, 101, 212)"
                  />
                }
                label={identity.fullyQualifiedName}
              />
            ))
          )}
        </React.Fragment>
      )}
      {giftCard.encrypted && (
        <TextField
          label="Gift card claim password"
          variant="outlined"
          type="password"
          onChange={updateInput}
          name="password"
          value={password}
          style={{ marginTop: 10, width: "100%" }}
        />
      )}
      {formErrors.selection.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 10, color: "rgb(0,0,0)" }}>{formErrors.selection[0]}</div>
      )}
    </React.Fragment>
  );
}
