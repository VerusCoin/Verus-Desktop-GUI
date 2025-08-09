import React from "react";
import PieChart from "react-minimal-pie-chart";
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  CONFIRMED_BALANCE,
  PRIVATE_BALANCE,
  RECEIVE_COIN,
  CHAIN_INFO,
  TRANSPARENT_BALANCE,
  SEND_COIN,
  API_SUCCESS,
  API_FAILED,
  IMMATURE_BALANCE,
  MINED_TX,
  MINTED_TX,
  IMMATURE_TX,
  STAKE_TX,
  INTEREST_BALANCE,
  REJECTED_CONFIRMATIONS,
  PUBLIC_BALANCE,
  SPLIT_MODAL,
  CONVERT_CURRENCY,
  SIMPLE_CONVERSION,
  CREATE_IDENTITY,
  API_UPDATE_ID,
  IS_PBAAS,
  Z_ONLY,
  LOCK_WITH_DELAY,
  ELECTRUM
} from "../../../../../util/constants/componentConstants";
import { VirtualizedTable } from '../../../../../containers/VirtualizedTable/VirtualizedTable'
import { timeConverter } from '../../../../../util/displayUtil/timeUtils'
import { SortDirection } from 'react-virtualized';
import SearchBar from '../../../../../containers/SearchBar/SearchBar'
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import WalletPaper from '../../../../../containers/WalletPaper/WalletPaper'
import TransactionCard from '../../../../../containers/TransactionCard/TransactionCard'
import { MenuItem, Tooltip, Typography, Link } from "@material-ui/core";
import CustomButton from "../../../../../containers/CustomButton/CustomButton";
import MigrationHelper from "../../../../../containers/MigrationHelper/MigrationHelper";
import { closeTextDialog, openIdentityCard, openSetupVaultModal, openTextDialog } from "../../../../../actions/actionDispatchers";
import { checkFlag } from "../../../../../util/flagUtils";
import { TIMELOCK_DELAY_FLAG } from "../../../../../util/constants/flags";
const { shell } = window.bridge

const WIKI_LITE_TO_NATIVE = "https://wiki.verus.io/#!how-to/how-to_convert-seed-to-wif.md"

export const CoinWalletRender = function() {
  return (
    <div className="col-md-8 col-lg-9" style={{ padding: 16, width: "80%", overflow: "scroll" }}>
      <WalletPaper
        style={{
          marginBottom: 16,
          display: "flex",
          padding: 0,
          border: "none",
          overflowX: "scroll",
        }}
      >
        <WalletPaper
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <div className="d-flex flex-row justify-content-between">
            <h6 style={{ fontSize: 14, margin: 0, width: "max-content" }}>
              {`Current ${this.props.coin} Balance`}
            </h6>
          </div>
          <div style={{ paddingTop: 5 }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <h5
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: 36,
                  fontWeight: "bold",
                }}
              >
                {Number(this.state.spendableBalance.crypto.toFixed(8))}
              </h5>
              <h5
                className="d-lg-flex align-items-lg-end"
                style={{
                  color: "rgb(0,0,0)",
                  fontSize: 16,
                  paddingBottom: 5,
                  paddingLeft: 8,
                  fontWeight: "bold",
                }}
              >
                {this.props.coin}
              </h5>
            </div>
            <div className="d-lg-flex justify-content-lg-start">
              <h1 style={{ margin: 0, fontSize: 16, color: "rgb(0,0,0)" }}>
                {`${
                  this.state.spendableBalance.fiat == null ? "-" : this.state.spendableBalance.fiat
                } ${this.props.fiatCurrency}`}
              </h1>
            </div>
          </div>
        </WalletPaper>
        {this.state.spendableBalance.crypto != this.state.pendingBalance.crypto && (
          <WalletPaper
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div className="d-flex flex-row justify-content-between">
              <h6 style={{ fontSize: 14, margin: 0, width: "max-content" }}>
                {`Pending ${this.props.coin} Balance`}
              </h6>
            </div>
            <div style={{ paddingTop: 5 }}>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <h5
                  style={{
                    color: "rgb(0,0,0)",
                    fontSize: 36,
                    fontWeight: "bold",
                  }}
                >
                  {Number(this.state.pendingBalance.crypto.toFixed(8))}
                </h5>
                <h5
                  className="d-lg-flex align-items-lg-end"
                  style={{
                    color: "rgb(0,0,0)",
                    fontSize: 16,
                    paddingBottom: 5,
                    paddingLeft: 8,
                    fontWeight: "bold",
                  }}
                >
                  {this.props.coin}
                </h5>
              </div>
              <div className="d-lg-flex justify-content-lg-start">
                <h1 style={{ margin: 0, fontSize: 16, color: "rgb(0,0,0)" }}>
                  {`${
                    this.state.pendingBalance.fiat == null ? "-" : this.state.pendingBalance.fiat
                  } ${this.props.fiatCurrency}`}
                </h1>
              </div>
            </div>
          </WalletPaper>
        )}
        {this.props.activeIdentity == null
          ? RenderBlockchainInfo.call(this)
          : RenderIdInfo.call(this)}
        {this.props.activeIdentity == null ? null : RenderIdVault.call(this)}
      </WalletPaper>
      {
        /* TODO: Change this when currencies get to mainnet */
        this.props.activatedCoins[this.props.coin] &&
        this.props.activatedCoins[this.props.coin].options.tags.includes(IS_PBAAS)
          ? WalletRenderCurrencyFunctions.call(this)
          : null
      }
      {WalletRenderBalances.call(this)}
      <TransactionCard
        transactions={
          this.props.transactions != null
            ? this.props.transactions.filter((tx) => {
                return (
                  (!this.props.filterGenerateTransactions ||
                    (tx.category !== MINED_TX &&
                      tx.category !== MINTED_TX &&
                      tx.category !== IMMATURE_TX &&
                      tx.category !== STAKE_TX)) &&
                  tx.confirmations !== REJECTED_CONFIRMATIONS
                );
              })
            : []
        }
        coin={this.props.coin}
        multiverseNameMap={this.props.multiverseNameMap}
      />
      {this.props.zOperations && this.props.zOperations.length > 0 && (
        <WalletPaper>
          <h6 className="card-title" style={{ fontSize: 14, margin: 0, width: "max-content" }}>
            {"Pending Transaction Log:"}
          </h6>
          {WalletRenderOperations.call(this)}
        </WalletPaper>
      )}
    </div>
  );
};

export const RenderBlockchainInfo = function () {
  const noRunningDaemon =
    this.state.walletLoadState.error &&
    this.state.walletLoadState.message != null &&
    this.state.walletLoadState.message.includes("No running");

  return (
    <WalletPaper
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div className="d-flex flex-row justify-content-between">
        <h6 style={{ fontSize: 14, margin: 0, width: "max-content" }}>
          Blockchain Status
        </h6>
        <button
          className="btn btn-primary border rounded"
          type="button"
          name={CHAIN_INFO}
          onClick={(e) => this.openModal(e, null)}
          style={{
            fontSize: 14,
            backgroundColor: "rgba(0,178,26,0)",
            borderWidth: 0,
            color: "rgb(133,135,150)",
            borderColor: "rgb(133, 135, 150)",
            fontWeight: "bold",
          }}
        >
          {"Chain Info"}
        </button>
      </div>
      <div
        className="d-lg-flex"
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          height: "100%"
        }}
      >
        {WalletRenderPie.call(this)}
        <h1
          style={{
            margin: 0,
            fontSize: 16,
            color: "rgb(0,0,0)",
            paddingLeft: 23,
            overflow: "-webkit-paged-x",
          }}
        >
          {this.state.walletLoadState.error && (
            <i
              className="fas fa-exclamation-triangle"
              style={{
                marginRight: 6,
                color: "rgb(236,124,43)",
                fontSize: 18,
              }}
            />
          )}
          {noRunningDaemon ? (
            <a
              onClick={() => this.tryNativeRelaunch()}
              href="#"
              style={{
                color: "#3f51b5"
              }}
            >
              {"No running daemon found. Click here to retry."}
            </a>
          ) : (
            this.state.walletLoadState.message
          )}
        </h1>
      </div>
    </WalletPaper>
  );
};

export const RenderIdInfo = function () {
  const { activeIdentity } = this.props

  return (
    <WalletPaper
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div className="d-flex flex-row justify-content-between">
        <h6 style={{ fontSize: 14, margin: 0, width: "max-content" }}>{"ID Status"}</h6>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary border rounded"
            type="button"
            disabled={activeIdentity.status === "revoked"}
            onClick={() =>
              this.openModal(
                null,
                {
                  modalType: API_UPDATE_ID,
                  chainTicker: this.props.coin,
                  identity: activeIdentity,
                },
                CREATE_IDENTITY
              )
            }
            style={{
              fontSize: 14,
              backgroundColor: "rgb(49, 101, 212)",
              borderWidth: 0,
              color: "#FFFFFF",
              borderColor: "rgb(49, 101, 212)",
              fontWeight: "bold",
            }}
          >
            {"Update"}
          </button>
          <button
            className="btn btn-primary border rounded"
            type="button"
            onClick={() => openIdentityCard(activeIdentity, this.props.coin)}
            style={{
              fontSize: 14,
              backgroundColor: "rgba(0,178,26,0)",
              borderWidth: 0,
              color: "rgb(133,135,150)",
              borderColor: "rgb(133, 135, 150)",
              fontWeight: "bold",
              marginLeft: 8
            }}
          >
            {"Info"}
          </button>
        </div>
      </div>
      <div
        className="d-lg-flex"
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 16,
            color: "rgb(0,0,0)",
            overflow: "-webkit-paged-x",
          }}
          className="text-capitalize"
        >
          {activeIdentity.status !== "active" && (
            <i
              className="fas fa-exclamation-triangle"
              style={{
                marginRight: 6,
                color: "rgb(236,124,43)",
                fontSize: 18,
              }}
            />
          )}
          {`${activeIdentity.status} as of block ${activeIdentity.blockheight}.`}
        </h1>
      </div>
    </WalletPaper>
  );
};

export const RenderIdVault = function () {
  const { activeIdentity, info } = this.props
  const isTimelockDelay = checkFlag(activeIdentity.identity.flags, TIMELOCK_DELAY_FLAG);
  const longestchain = info && info.longestchain ? info.longestchain : 0
  const timelock =
    longestchain > activeIdentity.identity.timelock && !isTimelockDelay
      ? 0
      : activeIdentity.identity.timelock;
  const activeCoin = this.props.activatedCoins[this.props.coin]

  return (
    <WalletPaper
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div className="d-flex flex-row justify-content-between">
        <h6 style={{ fontSize: 14, margin: 0, width: "max-content" }}>{"Vault Status"}</h6>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary border rounded"
            type="button"
            disabled={activeCoin == null}
            onClick={
              timelock === 0
                ? () =>
                    openSetupVaultModal(
                      LOCK_WITH_DELAY,
                      activeCoin.id,
                      activeCoin.mode,
                      `${activeIdentity.identity.name}@`
                    )
                : () => this.openUnlockIdentityModal()
            }
            style={{
              fontSize: 14,
              backgroundColor: "rgb(49, 101, 212)",
              borderWidth: 0,
              color: "#FFFFFF",
              borderColor: "rgb(49, 101, 212)",
              fontWeight: "bold",
              visibility: isTimelockDelay || timelock == 0 ? "unset" : "hidden",
            }}
          >
            {timelock === 0 ? "Setup Vault" : "Start Unlock"}
          </button>
        </div>
      </div>
      <div
        className="d-lg-flex"
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 16,
            color: "rgb(0,0,0)",
            overflow: "-webkit-paged-x",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <div style={{ fontWeight: "bold", color: timelock === 0 ? "black" : "#4AA658" }}>
              {timelock === 0
                ? "Vault not active."
                : isTimelockDelay
                ? "Vault active, funds locked."
                : "Vault active, funds will unlock."}
            </div>
            {timelock !== 0 && (
              <div style={{ fontSize: 14, marginTop: 6 }}>
                {isTimelockDelay
                  ? `Will unlock ${timelock + 20} blocks after unlock start.`
                  : `Will unlock at block ${timelock}.`}
              </div>
            )}
          </div>
        </h1>
      </div>
    </WalletPaper>
  );
};

export const WalletRenderPie = function() {
  const { NO_HEIGHT, state } = this
  const { percentage, error } = state.walletLoadState
  const noHeight = percentage === NO_HEIGHT

  return error ? (
    <div style={{ color: `rgb(49, 101, 212)` }}>
      <CircularProgress
        variant={"indeterminate"}
        thickness={4.5}
        size={60}
        color="inherit"
      />
    </div>
  ) : (
    <PieChart
      data={[{ value: 1, key: 1, color: `rgb(49, 101, 212)` }]}
      reveal={noHeight ? 100 : percentage}
      lineWidth={20}
      animate
      labelPosition={0}
      label={() => {
        return noHeight ? "-" : Math.round(percentage) + "%"
      }}
      labelStyle={{
        fontSize: "25px"
      }}
      style={{
        maxHeight: 60,
        minWidth: 60,
        maxWidth: 60
      }}
    />
  );
};

export const WalletRenderBalances = function() {
  const filteredBalances = this.state.walletDisplayBalances.filter(
    (balance) => {
      return (
        balance.currency === this.props.selectedCurrency &&
        !(
          balance.balanceAddrType === PUBLIC_BALANCE &&
          this.props.activatedCoins[this.props.coin] &&
          this.props.activatedCoins[this.props.coin].options.tags.includes(
            Z_ONLY
          )
        )
      );
    }
  );

  const walletDisplayBalances =
    filteredBalances.length === 0
      ? [
          {
            currency: this.props.selectedCurrency,
            balanceAddrType: PUBLIC_BALANCE,
            balanceType: CONFIRMED_BALANCE,
            balance:
              this.props.selectedCurrency !== this.props.coin &&
              this.state.walletDisplayBalances.length > 0
                ? 0
                : "-",
            balanceFiat: "-",
          },
        ]
      : filteredBalances;

  return (
    <WalletPaper
      style={{
        marginBottom: 16,
        backgroundColor: "#ffffff",
        paddingLeft: 8,
        paddingRight: 8,
        overflowX: "scroll",
        display: "flex",
      }}
    >
      {walletDisplayBalances.map((balanceObj, index) => {
        const {
          balanceType,
          balanceAddrType,
          balance,
          balanceFiat,
          sendable,
          receivable
        } = balanceObj;

        const balanceTag =
          balanceAddrType === PRIVATE_BALANCE
            ? PRIVATE_BALANCE
            : balanceType === CONFIRMED_BALANCE
            ? TRANSPARENT_BALANCE
            : balanceType === IMMATURE_BALANCE
            ? IMMATURE_BALANCE
            : balanceType === INTEREST_BALANCE
            ? INTEREST_BALANCE
            : null;

        return balanceTag == null ? null : (
          <div
            className="flex-grow-1"
            key={index}
            style={{
              paddingRight: 8,
              paddingLeft: 8,
              maxWidth: "100%",
              minWidth: 216,
              flex: 1,
            }}
          >
            <div className="col-lg-12" style={{ padding: 0, height: "100%" }}>
              <div className="card border rounded-0" style={{ height: "100%" }}>
                <div
                  className="card-body"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    className="d-flex flex-row justify-content-between"
                    style={{ paddingBottom: 3 }}
                  >
                    <h6
                      className="text-capitalize"
                      style={{
                        fontSize: 14,
                        margin: 0,
                      }}
                    >
                      <i
                        className={`far ${
                          balanceTag === PRIVATE_BALANCE
                            ? "fa-eye-slash"
                            : "fa-eye"
                        }`}
                        style={{
                          paddingRight: 6,
                          color: "rgb(133, 135, 150)",
                        }}
                      />
                      {balanceTag === INTEREST_BALANCE
                        ? "Unclaimed Interest"
                        : balanceTag + " Balance"}
                    </h6>
                  </div>
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      className="d-lg-flex justify-content-lg-start"
                      style={{ paddingBottom: 3, paddingTop: 3 }}
                    >
                      <h1
                        style={{
                          margin: 0,
                          fontSize: 16,
                          color: "rgb(0, 0, 0)",
                          fontWeight: "bold",
                        }}
                      >
                        {`${balance} ${this.props.selectedCurrency}`}
                      </h1>
                    </div>
                    <div
                      className="d-lg-flex justify-content-lg-start"
                      style={{ paddingBottom: 3, paddingTop: 3 }}
                    >
                      <h1
                        style={{
                          margin: 0,
                          fontSize: 14,
                        }}
                      >
                        {this.props.selectedCurrency !== this.props.coin ? '-' : `${balanceFiat} ${this.props.fiatCurrency}`}
                      </h1>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <Tooltip
                        title={
                          sendable != null && !sendable
                            ? ""
                            : balanceTag === INTEREST_BALANCE
                            ? "Claim"
                            : "Send"
                        }
                      >
                        <span
                          style={{
                            marginTop: 8,
                            marginRight: 8,
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={(e) =>
                              this.openModal(
                                null,
                                {
                                  balanceTag,
                                  fund: false,
                                  isMessage: false,
                                  currencyInfo: this.state.currencyInfo,
                                  identity: this.props.activeIdentity,
                                },
                                SEND_COIN
                              )
                            }
                            disabled={
                              balance === "-" ||
                              !this.props.addresses ||
                              (this.props.selectedCurrency !==
                                this.props.coin &&
                                !this.props.identities)
                            }
                            style={{
                              backgroundColor:
                                balanceTag === INTEREST_BALANCE
                                  ? "rgb(49, 101, 212)"
                                  : "rgb(212, 49, 62)",
                              borderColor:
                                balanceTag === INTEREST_BALANCE
                                  ? "rgb(49, 101, 212)"
                                  : "rgb(212, 49, 62)",
                              visibility:
                                sendable != null && !sendable
                                  ? "hidden"
                                  : "unset",
                              fontSize: 18,
                              borderWidth: 1,
                              fontWeight: "bold",
                              alignItems: "center",
                              display: "flex",
                              justifyContent: "flex-start",
                              paddingLeft: 8,
                              minWidth: 80,
                            }}
                          >
                            {balanceTag === INTEREST_BALANCE ? (
                              <ArrowDownward
                                fontSize="inherit"
                                name={SEND_COIN}
                              />
                            ) : (
                              <ArrowUpward
                                fontSize="inherit"
                                name={SEND_COIN}
                              />
                            )}
                            <div style={{ fontSize: 12, marginLeft: 8 }}>
                              {balanceTag === INTEREST_BALANCE
                                ? "Claim"
                                : "Send"}
                            </div>
                          </button>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          receivable != null && !receivable ? "" : "Receive"
                        }
                      >
                        <span
                          style={{
                            marginTop: 8,
                            marginRight: 8,
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            type="button"
                            name={RECEIVE_COIN}
                            onClick={(e) =>
                              this.openModal(
                                null,
                                {
                                  balanceTag,
                                  identity: this.props.activeIdentity,
                                },
                                RECEIVE_COIN,
                                SPLIT_MODAL
                              )
                            }
                            style={{
                              backgroundColor: "rgb(74, 166, 88)",
                              borderColor: "rgb(74, 166, 88)",
                              visibility:
                                receivable != null && !receivable
                                  ? "hidden"
                                  : "unset",
                              fontSize: 18,
                              borderWidth: 1,
                              fontWeight: "bold",
                              alignItems: "center",
                              display: "flex",
                              justifyContent: "flex-start",
                              paddingLeft: 8,
                              minWidth: 80,
                            }}
                          >
                            <ArrowDownward fontSize="inherit" />
                            <div style={{ fontSize: 12, marginLeft: 8 }}>
                              Receive
                            </div>
                          </button>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </WalletPaper>
  );
};

export const WalletRenderOperations = function() {
  const zOperations = this.props.zOperations
  const zOperationComps = zOperations.map((operation, index) => {
    return {
      status: operation.status,
      id: operation.id,
      time: operation.creation_time,
      opIndex: index,
      message: operation.error ? operation.error.message : '-'
    };
  });

  return (
    <div style={{ height: ((50 * zOperations.length) + 50), width: '100%' }}>
      <VirtualizedTable
        rowCount={zOperationComps.length}
        sortBy="time"
        sortDirection={ SortDirection.ASC }
        onRowClick={ ({rowData}) => this.openOpInfo(rowData) }
        rowGetter={({ index }) => zOperationComps[index]}
        columns={[
          {
            width: 125,
            cellDataGetter: ({ rowData }) => {
              return (
                <div style={{ minWidth: "max-content" }}>
                  <h3
                    className="text-uppercase"
                    style={{
                      marginBottom: 0,
                      fontSize: 16,
                      fontWeight: "bold",
                      color:
                        rowData.status === API_SUCCESS
                          ? "rgb(74, 166, 88)"
                          : rowData.status === API_FAILED
                          ? "rgb(212, 49, 62)"
                          : "#f8bb86"
                    }}
                  >
                    {rowData.status}
                  </h3>
                </div>
              );
            },
            flexGrow: 1,
            label: 'Status',
            dataKey: 'status',
          },
          {
            width: 150,
            flexGrow: 1,
            label: 'ID',
            dataKey: 'id',
          },
          {
            width: 125,
            cellDataGetter: ({ rowData }) => {
              const time = timeConverter(rowData.time)
              return time ? time : '-'
            },
            flexGrow: 1,
            label: 'Time',
            dataKey: 'time',
          },
          {
            width: 150,
            flexGrow: 1,
            label: 'Message',
            dataKey: 'message',
          },
        ]}
      />
    </div>
  )
}

export const WalletRenderCurrencyFunctions = function() {
  const { coin, selectedCurrency } = this.props

  return (
    <React.Fragment>
      <WalletPaper
        style={{
          marginBottom: 16,
          padding: 0,
          border: "none",
          display: "flex",
        }}
      >
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <CustomButton
            onClick={(e) => this.displayCurrencyInfo(selectedCurrency)}
            title={"Currency Info"}
            backgroundColor={"#3165D4"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              variant: "outlined",
              style: { width: "100%", height: "100%" },
            }}
          />
        </WalletPaper>
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <CustomButton
            onClick={(e) =>
              this.openModal(
                null,
                {
                  selectedMode: SIMPLE_CONVERSION,
                  selectedCurrency,
                },
                CONVERT_CURRENCY,
                SPLIT_MODAL
              )
            }
            title={"Convert Currencies"}
            backgroundColor={"#3165D4"}
            textColor={"white"}
            buttonProps={{
              size: "large",
              color: "default",
              variant: "outlined",
              style: { width: "100%", height: "100%" },
            }}
          />
        </WalletPaper>
        <WalletPaper
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <SearchBar
            containerStyle={{ width: "100%" }}
            disabled={this.state.loadingCurrency}
            label={`Search Currencies`}
            placeholder={"e.g. VRSC"}
            variant={"outlined"}
            clearable={true}
            onChange={(e) => this.updateCurrencySearchTerm(e.target.value)}
            onClear={() => {
              this.updateCurrencySearchTerm("");
            }}
            onSubmit={this.onCurrencySearchSubmit}
            value={this.state.currencySearchTerm}
          />
        </WalletPaper>
      </WalletPaper>
      {this.props.activatedCoins[coin] &&
        this.props.activatedCoins[coin].options.tags.includes(IS_PBAAS) && (
          <WalletPaper
            style={{
              marginBottom: 16,
              padding: 8,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography style={{ fontWeight: "bold", textAlign: "center" }}>
              {
                "Warning: All testnet coins/currencies have no value and will disappear whenever VRSCTEST is reset."
              }
            </Typography>
          </WalletPaper>
        )}
    </React.Fragment>
  );
};

export const WalletRenderCurrencyOptions = function() {
  const { whitelists, coin } = this.props
  const whitelist = whitelists[coin] ? whitelists[coin] : []

  return whitelist.map((currencyTicker, index) => {
    return <MenuItem key={index} value={index}>{currencyTicker}</MenuItem>
  })
};
