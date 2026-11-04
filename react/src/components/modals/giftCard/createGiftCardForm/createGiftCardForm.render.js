import React from 'react';
import TextField from "@material-ui/core/TextField";
import { FormControlLabel } from '@material-ui/core';
import CustomCheckbox from '../../../../containers/CustomCheckbox/CustomCheckbox';

export const CreateGiftCardFormRender = function() {
  return (
    <div
      className="col-xs-12 backround-gray"
      style={{
        width: "100%",
        height: "85%",
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "flex-start",
        flexDirection: "column",
        overflowY: "scroll"
      }}
    >
      {CreateGiftCardFormEnterRender.call(this)}
    </div>
  );
}

export const CreateGiftCardFormEnterRender = function() {
  const { state, updateInput, toggleRequirePassword } = this
  const { label, requirePassword, password, confirmPassword, formErrors } = state;

  return (
    <React.Fragment>
      <TextField
        label="Label"
        variant="outlined"
        onChange={updateInput}
        name="label"
        value={label}
        style={{ marginTop: 5, width: "100%" }}
      />
      <FormControlLabel
        control={
          <CustomCheckbox
            checkboxProps={{
              checked: requirePassword,
              onChange: toggleRequirePassword,
            }}
            colorChecked="rgb(49, 101, 212)"
            colorUnchecked="rgb(49, 101, 212)"
          />
        }
        label="Require claim password"
      />
      {requirePassword && (
        <React.Fragment>
          <div style={{ color: "rgb(236,124,43)" }}>
            <i className="fas fa-exclamation-triangle" style={{ paddingRight: 6 }} />
            {"If this claim password is lost, the gift card cannot be redeemed and its funds are gone forever."}
          </div>
          <TextField
            label="Claim password"
            variant="outlined"
            type="password"
            onChange={updateInput}
            name="password"
            value={password}
            style={{ marginTop: 5, width: "100%" }}
          />
          <TextField
            error={formErrors.confirmPassword.length > 0}
            helperText={
              formErrors.confirmPassword.length > 0
                ? formErrors.confirmPassword[0]
                : null
            }
            label="Confirm claim password"
            variant="outlined"
            type="password"
            onChange={updateInput}
            name="confirmPassword"
            value={confirmPassword}
            style={{ marginTop: 5, width: "100%" }}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
