import React from "react";
import WalletPaper from "../../../../../containers/WalletPaper/WalletPaper";
import {
  MINED_TX,
  MINTED_TX,
  IMMATURE_TX,
  STAKE_TX,
  MS_IDLE,
  MS_STAKING,
  MS_MINING,
  STAKING_CARD,
  MINING_CARD,
  IS_VERUS
} from "../../../../../util/constants/componentConstants";
import WalletBooklet from "../../../../../containers/WalletBooklet/WalletBooklet";
import TransactionCard from "../../../../../containers/TransactionCard/TransactionCard";
import GeneratorCard from "../../../../../containers/GeneratorCard/GeneratorCard";
import { FormControl, Select, MenuItem, Switch } from "@material-ui/core";
import NetworkOverviewCard from "../../../../../containers/NetworkOverviewCard/NetworkOverviewCard";
import AppsStyles from '../../apps.styles'
import ErrorIcon from '@material-ui/icons/Error';
const SERVER_OFF = 0;
const SERVER_OK = 1;
const SERVER_RPC_FAULT = 2;
const SERVER_WEBSOCKET_FAULT = 3;

export const getBridgekeeperControlState = (miningInfo, loading) => {
  const status = miningInfo && miningInfo.bridgekeeperstatus
  const statusAvailable =
    status != null && Number.isInteger(status.serverrunning)

  return {
    disabled: loading === true || !statusAvailable,
    hasError: statusAvailable && status.serverrunning > SERVER_OK,
    running: statusAvailable && status.serverrunning > SERVER_OFF,
    statusAvailable
  }
}

export const MiningWalletRender = function() {
  const {
    miningState,
    coin,
    coinObj,
    miningInfo,
    currentSupply,
    balances,
    handleThreadChange,
    loading,
    cpuData,
    blockReward,
    fiatPrice,
    fiatCurrency,
    toggleStaking,
    miningBookletOpen,
    stakingBookletOpen
  } = this.props;

  return (
    <div
      className="col-md-8 col-lg-9"
      style={{ padding: 16, overflow: "scroll" }}
    >
      <WalletPaper
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <NetworkOverviewCard coin={coin}/>
        </div>
      </WalletPaper>
      {MiningWalletFunctions.call(this)}
      {coinObj.options.tags.includes(IS_VERUS) && (
        <WalletBooklet
          expandedPanelIndex={stakingBookletOpen ? 0 : -1}
          disabled={this.state[this.STAKING_BOOKLET]}
          handleClick={() => this.toggleBooklet(this.STAKING_BOOKLET)}
          pages={[
            {
              title: `Staking Overview - (Staking: ${
                miningState === MS_IDLE
                  ? "-"
                  : miningState.includes(MS_STAKING)
                  ? "On"
                  : "Off"
              })`,
              content: (
                <React.Fragment>
                  {
                    <GeneratorCard
                      coin={coin}
                      miningStatus={miningState}
                      cardType={STAKING_CARD}
                      miningInfo={miningInfo}
                      currentSupply={currentSupply}
                      stakingFunction={() => toggleStaking(coin)}
                      stakeableBalance={
                        balances != null ? balances.native.public.staking : null
                      }
                      totalBalance={
                        balances != null
                          ? balances.native.public.confirmed +
                            balances.native.public.unconfirmed +
                            balances.native.public.immature +
                            (balances.native.private.confirmed || 0)
                          : null
                      }
                      maxCores={cpuData.cores ? cpuData.cores : 0}
                      currentReward={blockReward ? blockReward.miner : null}
                      fiatPrice={
                        fiatPrice != null
                          ? Number(fiatPrice[fiatCurrency])
                          : null
                      }
                      fiatCurr={fiatCurrency}
                      loading={loading}
                    />
                  }
                </React.Fragment>
              )
            }
          ]}
          containerStyle={{ marginBottom: 16 }}
          defaultPageIndex={0}
        />
      )}
      <WalletBooklet
        expandedPanelIndex={miningBookletOpen ? 0 : -1}
        disabled={this.state[this.MINING_BOOKLET]}
        handleClick={() => this.toggleBooklet(this.MINING_BOOKLET)}
        pages={[
          {
            title: `Mining Overview - (Mining: ${
              miningState === MS_IDLE
                ? "-"
                : miningState.includes(MS_MINING)
                ? "On"
                : "Off"
            })`,
            content: (
              <GeneratorCard
                coin={coin}
                miningStatus={miningState}
                cardType={MINING_CARD}
                miningInfo={miningInfo}
                currentSupply={currentSupply}
                handleMiningThreadChange={(value, coin) =>
                  handleThreadChange({ target: { value } }, coin)
                }
                maxCores={cpuData.cores ? cpuData.cores : 0}
                currentReward={blockReward ? blockReward.miner : null}
                fiatPrice={
                  fiatPrice != null ? Number(fiatPrice[fiatCurrency]) : null
                }
                fiatCurr={fiatCurrency}
                loading={loading}
              />
            )
          }
        ]}
        containerStyle={{ marginBottom: 16 }}
        defaultPageIndex={0}
      />
      <TransactionCard
        transactions={
          this.props.transactions != null
            ? this.props.transactions.filter(tx => {
                return (
                  tx.category === MINED_TX ||
                  tx.category === MINTED_TX ||
                  tx.category === IMMATURE_TX ||
                  tx.category === STAKE_TX
                );
              })
            : []
        }
        coin={this.props.coin}
        title={coinObj.options.tags.includes(IS_VERUS) ? "Mining/Staking Transactions" : "Mining Transactions"}
        multiverseNameMap={this.props.multiverseNameMap}
      />
    </div>
  );
};

export const MiningWalletFunctions = function() {
  const { props } = this
  const {
    coin,
    miningState,
    toggleStaking,
    handleThreadChange,
    loading,
    cpuData,
    miningInfo,
    addresses,
    coinObj,
    toggleBridging
  } = props;

  const coinAddresses = addresses
  const bridgekeeperControl = getBridgekeeperControlState(miningInfo, loading)

  const coresArr = Array.apply(
    null,
    Array(cpuData.cores ? cpuData.cores : 0)
  );

  return (
    <WalletPaper
      style={{
        marginBottom: 16,
        padding: 0,
        border: "none",
        display: "flex",
      }}
    >
      {coinObj.options.tags.includes(IS_VERUS) && (
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <h6 className="card-title" style={{ fontSize: 14, margin: 0, width: "max-content" }}>
            {"Staking"}
          </h6>
          <div style={{ color: `rgb(49, 101, 212)` }}>
            <Switch
              checked={miningState.includes(MS_STAKING)}
              onChange={() => toggleStaking(coin)}
              disabled={miningState === MS_IDLE}
              value="staking"
              color="primary"
            />
          </div>
        </WalletPaper>
      )}
      <WalletPaper
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <h6 className="card-title" style={{ fontSize: 14, margin: 0, width: "max-content" }}>
          {"Mining"}
        </h6>
        <FormControl variant="outlined">
          <Select
            style={{ width: 120 }}
            value={
              miningState !== MS_IDLE && !loading
                ? miningInfo.generate
                  ? miningInfo.numthreads
                  : 0
                : -1
            }
            onChange={(event) => handleThreadChange(event, coin)}
            disabled={miningState === MS_IDLE || loading}
          >
            {(miningState === MS_IDLE || loading) && (
              <MenuItem value={-1}>
                <em>{"Loading..."}</em>
              </MenuItem>
            )}
            <MenuItem value={0}>{"Off"}</MenuItem>
            {coresArr.map((value, index) => {
              return (
                <MenuItem key={index} value={index + 1}>{`${index + 1} ${
                  index == 0 ? "thread" : "threads"
                }`}</MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </WalletPaper>
      {!coinObj.options.tags.includes(IS_VERUS) && (
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <h6 className="card-title" style={{ fontSize: 14, margin: 0, width: "max-content" }}>
            {"Shielding"}
          </h6>
          <button
            className="btn btn-primary border rounded"
            type="button"
            onClick={this.openShieldCoinbaseModal}
            disabled={coinAddresses == null}
            style={{
              fontSize: 14,
              backgroundColor: "rgba(0,178,26,0)",
              borderWidth: 0,
              color: "rgb(133,135,150)",
              borderColor: "rgb(133, 135, 150)",
              fontWeight: "bold",
            }}
          >
            {"Shield Rewards"}
          </button>
        </WalletPaper>
      )}
      {coinObj.id === "VRSC" && (
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <div
          style={{
            backgroundColor: "white",
            flex: 3,
            display: "flex",
            flexDirection: "column",
            flexBasis: '10%'
          }}
        >
            <h6 className="card-title" style={{ fontSize: 14, margin: 0, width: "max-content" }}>
              {"Bridgekeeper"}{bridgekeeperControl.hasError && <ErrorIcon style={{ color: "red" }}></ErrorIcon>}
            </h6>
            <h8 className="card-title" style={{ fontSize: 10, margin: 0, width: "max-content" }}>
              {"(Requires mining or staking to be active)"}
            </h8>

          </div>
          <div style={{ color: `rgb(49, 101, 212)` }}>
            <Switch
              checked={bridgekeeperControl.running}
              onChange={() => toggleBridging(coin)}
              disabled={bridgekeeperControl.disabled}
              value="bridging"
              color="primary"
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={this.startBridgekeeper}
            disabled={false}
            style={{
              fontSize: 14,
              backgroundColor: "rgba(0,178,26,0)",
              borderWidth: 0,
              color: "rgb(133,135,150)",
              borderColor: "rgb(0,0,0)",
              fontWeight: "bold",
            }}
          >
            <i className="fas fa-cog" style={AppsStyles.topBarMenuItemIcon} />
          </button>
        </WalletPaper>
      )}
    </WalletPaper>
  );
};
