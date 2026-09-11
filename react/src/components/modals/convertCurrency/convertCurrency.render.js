import React from 'react';
import { CONVERSION_OVERVIEW } from '../../../util/constants/componentConstants';
import ConvertCurrencyForm from './convertCurrencyForm/convertCurrencyForm'
import CircularProgress from '@material-ui/core/CircularProgress';
import ConversionOverview from './conversionOverview/conversionOverview';

export const ConvertCurrencyRender = function() {
  // return (
  //   <div
  //     style={{
  //       width: "100%",
  //       height: "100%",
  //       alignItems: "center",
  //       justifyContent: "center",
  //       display: "flex",
  //       flexDirection: "column",
  //       paddingBottom: 56,
  //     }}
  //   >
  //     {ConvertCurrencyUnderConstruction.call(this)}
  //   </div>
  // );
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {this.state.loading ? (
        <div
          className=".animated .fadeIn .fadeOut"
          style={{
            backgroundColor: "rgb(28, 28, 28, 0.6)",
            width: 708,
            height: "100%",
            position: "absolute",
            zIndex: 2,
            marginLeft: -16,
            marginTop: -50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <CircularProgress
            size={96}
            style={{
              color: "white",
              marginBottom: 24,
            }}
          />
          {this.state.loadingText}
        </div>
      ) : null}
      {this.state.selectedMode === CONVERSION_OVERVIEW ? (
        <ConversionOverview />
      ) : (
        <ConvertCurrencyForm
          mode={this.state.selectedMode}
          setLoading={this.setLoading}
          initCurrency={this.state.initCleared ? null : this.props.modalProps.selectedCurrency}
          setSelectedMode={this.setSelectedMode}
          clearInitCurrency={this.clearInitCurrency}
        />
      )}
    </div>
  );
};

export const ConvertCurrencyUnderConstruction = function() {
  return (
    <React.Fragment>
      <i className="fas fa-tools" style={{ fontSize: 80, color: "#959595" }} />
      <div
        style={{
          marginTop: 30,
          textAlign: "center",
          paddingRight: 24,
          paddingLeft: 24,
        }}
      >
        {
          "This section is currently being worked on to accomodate cross-chain sends and conversions. Until GUI support is available, try them out through the Verus CLI!"
        }
      </div>
    </React.Fragment>
  );
}
