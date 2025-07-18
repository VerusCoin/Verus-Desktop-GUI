import React from "react";
import CustomCheckbox from '../../../../containers/CustomCheckbox/CustomCheckbox'
import {
  LITE,
  NATIVE,
  ELECTRUM,
  ETH,
  NATIVE_MINE,
  NATIVE_RESCAN,
  NATIVE_STAKE,
  NATIVE_MINE_THREADS,
  NATIVE_REINDEX,
  IS_VERUS,
  ERC20,
  ADD_PBAAS_COIN,
  IMPORT_COIN,
  ADD_DEFAULT_COIN,
  NATIVE_BOOTSTRAP
} from "../../../../util/constants/componentConstants";
import ImportCoinSelector from "./selectors/importCoinSelector/importCoinSelector";
import DefaultCoinSelector from "./selectors/defaultCoinSelector/defaultCoinSelector";
import PbaasChainSelector from "./selectors/pbaasChainSelector/pbaasChainSelector";

export const SelectCoinRender = function() {  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
      {this.state.chosenCoin ? SelectModeForm.call(this) : SelectCoinForm.call(this)}
    </div>
  );
};

export const SelectCoinForm = function() {
  const COMPONENT_PROPS = {
    setModalLock: this.props.setModalLock,
    setSelectedCoin: this.getSelectedCoin,
    clearCoin: this.clearCoin,
    setSelectedCoinSource: this.props.setSelectedCoinSource,
    chooseCoin: this.chooseCoin,
    selectedCoin: this.state.selectedCoin
  }

  const COIN_SELECTORS = {
    [ADD_PBAAS_COIN]: <PbaasChainSelector {...COMPONENT_PROPS} />,
    [IMPORT_COIN]: <ImportCoinSelector {...COMPONENT_PROPS} />,
    [ADD_DEFAULT_COIN]: <DefaultCoinSelector {...COMPONENT_PROPS} />,
  };

  return (
    <React.Fragment>
      {COIN_SELECTORS[this.props.selectedCoinSource]}
      <button
        className="btn btn-primary"
        type="button"
        onClick={this.chooseCoin}
        style={{
          fontSize: 14,
          backgroundColor: "rgb(49, 101, 212)",
          borderWidth: 1,
          borderColor: "rgb(49, 101, 212)",
          paddingRight: 20,
          paddingLeft: 20,
          marginTop: 40,
          visibility: this.state.selectedCoin ? "unset" : "hidden",
          fontWeight: "bold",
        }}
      >
        {"Continue"}
      </button>
    </React.Fragment>
  );
}

export const SelectModeForm = function() {
  const availableModes = this.state.chosenCoin.available_modes
  const isNative = availableModes[NATIVE]
  const isLite =
    availableModes[ETH] || availableModes[ELECTRUM] || availableModes[ERC20];
  const { selectedMode } = this.state
  const bootstrapSupportedCoins = [
      "VRSC",
      "VRSCTEST",
      "VARRR",
      "VDEX",
      "CHIPS"
  ];
  return (
    <div className="d-sm-flex flex-column justify-content-sm-center">
      <div className="d-flex d-sm-flex justify-content-center align-items-center justify-content-sm-center align-items-sm-center">
        <h1 style={{ fontSize: 16, marginBottom: 0, color: "rgb(0,0,0)" }}>
          Choose preferred mode for&nbsp;
        </h1>
        <button
          className="btn btn-primary d-md-flex d-lg-flex justify-content-md-center align-items-md-center justify-content-lg-center"
          type="button"
          style={{
            backgroundColor: "rgba(78,115,223,0)",
            borderColor: "rgb(133, 135, 150)",
            borderWidth: 1,
            borderRadius: 0,
            paddingTop: 4,
            paddingBottom: 4,
            paddingRight: 14,
            paddingLeft: 15,
            marginBottom: 2,
            color: "rgb(0,0,0)",
          }}
          onClick={this.clearCoin}
        >
          <strong>{this.state.chosenCoin.name}</strong>
          <i
            className="fas fa-pencil-alt"
            style={{ paddingLeft: 6, color: "rgb(133, 135, 150)" }}
          />
        </button>
      </div>
      <div
        className="d-sm-flex justify-content-sm-center align-items-sm-center"
        style={{ paddingTop: 9 }}
      >
        <h1 className="text-center" style={{ fontSize: 16, marginBottom: 0, color: "rgb(0,0,0)" }}>
          Use a seed (<strong>lite mode</strong>) or download the full blockchain (
          <strong>native mode</strong>)
        </h1>
      </div>
      <div />
      <div
        className="d-flex d-sm-flex justify-content-center justify-content-sm-center"
        style={{ paddingTop: 27, height: 75 }}
      >
        <button
          className={`btn d-lg-flex justify-content-lg-center coin-mode-border-on-hover ${
            selectedMode === LITE ? "active-coin-mode" : ""
          } ${isLite ? "abled" : ""}`}
          type="button"
          disabled={!isLite}
          onClick={() => this.selectMode(LITE)}
          style={{
            color: "rgb(0,0,0)",
            backgroundColor: "rgba(78,115,223,0)",
            borderRadius: 0,
            width: 120,
            marginRight: 30,
          }}
        >
          <strong>Lite</strong>
        </button>
        <button
          className={`btn d-lg-flex justify-content-lg-center coin-mode-border-on-hover ${
            selectedMode === NATIVE ? "active-coin-mode" : ""
          } ${isNative ? "abled" : ""}`}
          type="button"
          onClick={() => this.selectMode(NATIVE)}
          disabled={!isNative}
          style={{
            color: "rgb(0,0,0)",
            backgroundColor: "rgba(78,115,223,0)",
            borderRadius: 0,
            width: 120,
            marginLeft: 30,
          }}
        >
          <strong>Native</strong>
        </button>
      </div>
      {this.state.selectedMode === NATIVE && (
        <div
          className="d-flex d-sm-flex d-md-flex d-lg-flex flex-column align-items-center align-items-sm-center align-items-md-center justify-content-lg-center align-items-lg-center"
          style={{ paddingTop: 28 }}
        >
          <div>
            {this.state.chosenCoin.options.tags.includes(IS_VERUS) && (
              <div>
                <div className="form-check d-flex align-items-center" style={{ padding: 0 }}>
                  <CustomCheckbox
                    checkboxProps={{
                      checked: this.state.nativeOptions[NATIVE_STAKE],
                      onChange: this.checkBox,
                      name: NATIVE_STAKE,
                    }}
                    colorChecked="rgb(49, 101, 212)"
                    colorUnchecked="rgb(49, 101, 212)"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="formCheck-1"
                    style={{ color: "rgb(0,0,0)" }}
                  >
                    {"Start staking"}
                  </label>
                </div>
              </div>
            )}
            <div className="d-flex d-sm-flex d-md-flex d-lg-flex align-items-center align-items-sm-center align-items-md-center align-items-lg-center">
              <div className="form-check d-flex align-items-center" style={{ padding: 0 }}>
                <CustomCheckbox
                  checkboxProps={{
                    checked: this.state.nativeOptions[NATIVE_MINE],
                    onChange: this.checkBox,
                    name: NATIVE_MINE,
                  }}
                  colorChecked="rgb(49, 101, 212)"
                  colorUnchecked="rgb(49, 101, 212)"
                />
                <label
                  className="form-check-label"
                  htmlFor="formCheck-1"
                  style={{ color: "rgb(0,0,0)" }}
                >
                  {"Start mining"}
                </label>
              </div>
              <input
                type="number"
                style={{ marginRight: 10, marginLeft: 80, width: 104 }}
                value={this.state.nativeOptions[NATIVE_MINE_THREADS]}
                min={0}
                step={1}
                onChange={this.updateThreads}
                placeholder="# threads"
              />
            </div>
            <div>
              <div className="form-check d-flex align-items-center" style={{ padding: 0 }}>
                <CustomCheckbox
                  checkboxProps={{
                    checked: this.state.nativeOptions[NATIVE_REINDEX],
                    onChange: this.checkBox,
                    name: NATIVE_REINDEX,
                  }}
                  colorChecked="rgb(49, 101, 212)"
                  colorUnchecked="rgb(49, 101, 212)"
                />
                <label
                  className="form-check-label"
                  htmlFor="formCheck-1"
                  style={{ color: "rgb(0,0,0)" }}
                >
                  {"Reindex blockchain"}
                </label>
              </div>
            </div>
            <div>
              <div className="form-check d-flex align-items-center" style={{ padding: 0 }}>
                <CustomCheckbox
                  checkboxProps={{
                    checked: this.state.nativeOptions[NATIVE_RESCAN],
                    onChange: this.checkBox,
                    name: NATIVE_RESCAN,
                  }}
                  colorChecked="rgb(49, 101, 212)"
                  colorUnchecked="rgb(49, 101, 212)"
                />
                <label
                  className="form-check-label"
                  htmlFor="formCheck-1"
                  style={{ color: "rgb(0,0,0)" }}
                >
                  {"Rescan wallet"}
                </label>
              </div>
            </div>
            {(bootstrapSupportedCoins.includes(this.state.chosenCoin.id)) && (
              <div>
                <div className="form-check d-flex align-items-center" style={{ padding: 0 }}>
                  <CustomCheckbox
                    checkboxProps={{
                      checked: this.state.nativeOptions[NATIVE_BOOTSTRAP],
                      onChange: this.checkBox,
                      name: NATIVE_BOOTSTRAP,
                    }}
                    colorChecked="rgb(49, 101, 212)"
                    colorUnchecked="rgb(49, 101, 212)"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="formCheck-1"
                    style={{ color: "rgb(0,0,0)" }}
                  >
                    {"Bootstrap"}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="d-flex d-sm-flex justify-content-center justify-content-sm-center">
        <button
          className="btn btn-primary"
          type="button"
          onClick={this.chooseMode}
          style={{
            fontSize: 14,
            backgroundColor: "rgb(49, 101, 212)",
            borderWidth: 1,
            borderColor: "rgb(49, 101, 212)",
            paddingRight: 20,
            paddingLeft: 20,
            marginTop: 30,
            visibility: this.state.selectedCoin ? "unset" : "hidden",
          }}
        >
          <strong>{"Add Coin"}</strong>
        </button>
      </div>
    </div>
  );
}
