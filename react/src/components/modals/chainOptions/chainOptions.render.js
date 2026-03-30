import React from 'react';
import {
  NATIVE_REINDEX,
  NATIVE_RESCAN,
  NATIVE_ZAPWALLETTXES,
  NATIVE_BOOTSTRAP,
} from "../../../util/constants/componentConstants";

export const ChainOptionsRender = function() {
  const bootstrapSupportedCoins = [
      "VRSC",
      "VRSCTEST",
      "VARRR",
      "VDEX",
      "CHIPS"
  ];

  let options = [
    {
      title: "Reindex",
      onClick: () => this.selectRestartOption([NATIVE_REINDEX]),
      label: "Re-download and index the entire blockchain",
      description: "Re-launches coin daemon. Usually takes a few hours.",
    },
    {
      title: "Rescan",
      onClick: () => this.selectRestartOption([NATIVE_RESCAN]),
      label: "Rescan wallet transactions and balances",
      description: "Re-launches coin daemon. Usually takes a few minutes.",
    },
    {
      title: "Rescan+",
      onClick: () =>
        this.selectRestartOption([
          NATIVE_RESCAN,
          NATIVE_ZAPWALLETTXES,
        ]),
      label: "Clear and rescan wallet transactions (zapwallettxes)",
      description: "Clear transactions + rescan. Takes longer than a basic rescan.",
    },
    {
      title: "Reset",
      onClick: () =>
        this.selectRestartOption([
          NATIVE_REINDEX,
          NATIVE_RESCAN,
          NATIVE_ZAPWALLETTXES,
        ]),
      label: "All of the above",
      description:
        "Fully rescan wallet, and reindex blockchain. Could take a while.",
    },
    {
      title: "Relaunch",
      onClick: () =>
        this.selectRestartOption([]),
      label: "Relaunch daemon",
      description:
        "Re-launches the coin daemon. Usually takes a few minutes.",
    }
  ];

  if (bootstrapSupportedCoins.includes(this.props.activeCoin.id)) {
    options.push({
      title: "Bootstrap",
      onClick: () =>
        this.selectRestartOption([NATIVE_BOOTSTRAP]),
      label: "Bootstrap chain & relaunch daemon",
      description:
        "Downloads chain data and re-launches the coin daemon. Could take a while.",
    })
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 96
      }}
    >
      <div style={{
        fontWeight: "bold",
        marginBottom: 48
      }}>{`${this.props.activeCoin.name} Options`}</div>
      {options.map((option) => {
        return (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-start",
              marginBottom: 32
            }}
          >
            <button
              className="btn btn-primary"
              type="button"
              onClick={option.onClick}
              disabled={this.state.loading}
              style={{
                fontSize: 16,
                borderWidth: 1,
                fontWeight: "bold",
                alignItems: "center",
                minWidth: 100,
                borderColor: "black",
                color: "black",
                background: "white",
                borderRadius: 10,
                marginRight: 16,
              }}
            >
              {option.title}
            </button>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  height: 24,
                }}
              >
                {option.label}
              </div>
              <div
                style={{
                  color: "#717070",
                  fontSize: 14,
                }}
              >
                {option.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


