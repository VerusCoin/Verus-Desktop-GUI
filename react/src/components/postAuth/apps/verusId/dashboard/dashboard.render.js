import React from 'react';
import { IS_VERUS, NATIVE, ID_REVOKED, IDENTITY_OFFERS_TAB } from '../../../../../util/constants/componentConstants';
import Tooltip from '@material-ui/core/Tooltip';
import Block from '@material-ui/icons/Block';
import SwapHoriz from '@material-ui/icons/SwapHoriz';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import WalletPaper from '../../../../../containers/WalletPaper/WalletPaper';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import { openAddCoinModal, openIdentityCard } from '../../../../../actions/actionDispatchers';
import { copyDataToClipboard } from '../../../../../util/copyToClipboard';
import { checkFlag } from '../../../../../util/flagUtils';
import { TIMELOCK_DELAY_FLAG } from '../../../../../util/constants/flags';

export const DashboardRender = function() {
  //TODO: Move to parent component so this isnt re-calculated at render
  const verusProtocolCoins = Object.values(this.props.activatedCoins).filter((coinObj) => {
    return coinObj.options.tags.includes(IS_VERUS) && coinObj.mode === NATIVE
  })
  const identityChains = Object.keys(this.props.identities)

  return (
    <div
      className="col-md-8 col-lg-9"
      style={{ padding: 16, overflow: "scroll" }}
    >
      {this.state.revokeId ? DashboardRevokeDialogue.call(this) : null}
      <WalletPaper style={{ marginBottom: 16 }}>
        <h6
          className="card-title"
          style={{ fontSize: 14, margin: 0, width: "100%" }}
        >
          {"Identity Overview"}
        </h6>
        <div className="d-lg-flex justify-content-lg-center">
          <div
            className="col-lg-3"
            style={{
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: "column",
              paddingTop: 9,
              paddingLeft: 0
            }}
          >
            <div
              className={`dropdown ${
                this.state.nameReservationDropdownOpen ? "show" : ""
              }`}
              ref={node => (this.reservationDropdownMenu = node)}
              style={{
                marginBottom: 5,
                width: "100%"
              }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={
                  identityChains.length === 1
                    ? () => this.openCommitNameModal(identityChains[0])
                    : this.toggleReservationDropdown
                }
                disabled={identityChains.length === 0}
                style={{
                  fontSize: 14,
                  backgroundColor: "rgb(49, 101, 212)",
                  borderWidth: 1,
                  borderColor: "rgb(49, 101, 212)",
                  paddingRight: 20,
                  paddingLeft: 20,
                  width: "100%"
                }}
              >
                <strong>{"Commit Name"}</strong>
              </button>
              <div
                className={`dropdown-menu ${
                  this.state.nameReservationDropdownOpen ? "show" : ""
                }`}
                role="menu"
                style={{
                  overflowY: "scroll",
                  height: "max-content",
                  maxHeight: 217
                }}
              >
                <h6 className="dropdown-header" role="presentation">
                  {"Select chain:"}
                </h6>
                {verusProtocolCoins.map((coinObj, index) => {
                  if (this.props.identities[coinObj.id] == null) return null;
                  else
                    return (
                      <a
                        className="dropdown-item"
                        key={index}
                        role="presentation"
                        href="#"
                        onClick={() => this.openCommitNameModal(coinObj.id)}
                      >
                        {coinObj.name}
                      </a>
                    );
                })}
              </div>
            </div>
            <div
              className={`dropdown ${
                this.state.idRecoveryDropdownOpen ? "show" : ""
              }`}
              ref={node => (this.recoveryDropdownMenu = node)}
              style={{
                marginBottom: 5,
                width: "100%"
              }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={
                  identityChains.length === 1
                    ? () => this.openRecoverIdModal(identityChains[0])
                    : this.toggleRecoveryDropdown
                }
                disabled={identityChains.length === 0}
                style={{
                  fontSize: 14,
                  backgroundColor: "rgb(49, 101, 212)",
                  borderWidth: 1,
                  borderColor: "rgb(49, 101, 212)",
                  paddingRight: 20,
                  paddingLeft: 20,
                  width: "100%"
                }}
              >
                <strong>{"Recover a Verus ID"}</strong>
              </button>
              <div
                className={`dropdown-menu ${
                  this.state.idRecoveryDropdownOpen ? "show" : ""
                }`}
                role="menu"
                style={{
                  overflowY: "scroll",
                  height: "max-content",
                  maxHeight: 217
                }}
              >
                <h6 className="dropdown-header" role="presentation">
                  {"Select chain:"}
                </h6>
                {verusProtocolCoins.map((coinObj, index) => {
                  if (this.props.identities[coinObj.id] == null) return null;
                  else
                    return (
                      <a
                        className="dropdown-item"
                        key={index}
                        role="presentation"
                        href="#"
                        onClick={() => this.openRecoverIdModal(coinObj.id)}
                      >
                        {coinObj.name}
                      </a>
                    );
                })}
              </div>
            </div>
            <div
              className={`dropdown ${
                this.state.signDataDropdownOpen ? "show" : ""
              }`}
              ref={node => (this.signDataDropdownMenu = node)}
              style={{
                marginBottom: 5,
                width: "100%"
              }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={
                  identityChains.length === 1
                    ? () => this.openSignIdDataModal(identityChains[0])
                    : this.toggleSignDataDropdown
                }
                disabled={identityChains.length === 0}
                style={{
                  fontSize: 14,
                  backgroundColor: "rgb(49, 101, 212)",
                  borderWidth: 1,
                  borderColor: "rgb(49, 101, 212)",
                  paddingRight: 20,
                  paddingLeft: 20,
                  width: "100%",
                  marginTop: 10
                }}
              >
                <strong>{"Sign Data"}</strong>
              </button>
              <div
                className={`dropdown-menu ${
                  this.state.signDataDropdownOpen ? "show" : ""
                }`}
                role="menu"
                style={{
                  overflowY: "scroll",
                  height: "max-content",
                  maxHeight: 217
                }}
              >
                <h6 className="dropdown-header" role="presentation">
                  {"Select chain:"}
                </h6>
                {verusProtocolCoins.map((coinObj, index) => {
                  if (this.props.identities[coinObj.id] == null) return null;
                  else
                    return (
                      <a
                        className="dropdown-item"
                        key={index}
                        role="presentation"
                        href="#"
                        onClick={() => this.openSignIdDataModal(coinObj.id)}
                      >
                        {coinObj.name}
                      </a>
                    );
                })}
              </div>
            </div>
            <div
              className={`dropdown ${
                this.state.verifyDataDropdownOpen ? "show" : ""
              }`}
              ref={node => (this.verifyDataDropdownMenu = node)}
              style={{
                marginBottom: 5,
                width: "100%"
              }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={
                  identityChains.length === 1
                    ? () => this.openVerifyIdDataModal(identityChains[0])
                    : this.toggleVerifyDataDropdown
                }
                disabled={identityChains.length === 0}
                style={{
                  fontSize: 14,
                  backgroundColor: "rgb(49, 101, 212)",
                  borderWidth: 1,
                  borderColor: "rgb(49, 101, 212)",
                  paddingRight: 20,
                  paddingLeft: 20,
                  width: "100%"
                }}
              >
                <strong>{"Verify Signed Data"}</strong>
              </button>
              <div
                className={`dropdown-menu ${
                  this.state.verifyDataDropdownOpen ? "show" : ""
                }`}
                role="menu"
                style={{
                  overflowY: "scroll",
                  height: "max-content",
                  maxHeight: 217
                }}
              >
                <h6 className="dropdown-header" role="presentation">
                  {"Select chain:"}
                </h6>
                {verusProtocolCoins.map((coinObj, index) => {
                  if (this.props.identities[coinObj.id] == null) return null;
                  else
                    return (
                      <a
                        className="dropdown-item"
                        key={index}
                        role="presentation"
                        href="#"
                        onClick={() => this.openVerifyIdDataModal(coinObj.id)}
                      >
                        {coinObj.name}
                      </a>
                    );
                })}
              </div>
            </div>
          </div>
          <div
            className="col d-lg-flex"
            style={{
              paddingTop: 9,
              alignItems: "center",
              color: "rgb(0,0,0)",
              flexDirection: "column",
              marginBottom: 5
            }}
          >
            {verusProtocolCoins.length == 0 ? (
              <div style={{ textAlign: "center" }}>
                <a
                  href="#"
                  style={{ color: "rgb(49, 101, 212)" }}
                  onClick={() => openAddCoinModal()}
                >
                  {
                    "Add a Verus protocol coin (VRSC or VRSCTEST) to start making IDs!"
                  }
                </a>
              </div>
            ) : this.state.displayNameCommitments.length > 0 ? (
              DashboardRenderTable.call(this)
            ) : (
              <React.Fragment>
                <div style={{ textAlign: "center" }}>
                  <a
                    href={identityChains.length === 0 ? null : "#"}
                    style={{
                      color:
                        identityChains.length === 0
                          ? "black"
                          : "rgb(49, 101, 212)"
                    }}
                    onClick={
                      identityChains.length === 0
                        ? () => {
                            return 0;
                          }
                        : identityChains.length === 1
                        ? () => this.openCommitNameModal(identityChains[0])
                        : this.toggleReservationDropdown
                    }
                  >
                    {"No name commitments. Commit a name to create an ID!"}
                  </a>
                </div>
                <div style={{ textAlign: "center", marginTop: 5 }}>
                  {"Committing a name costs as little as one transaction fee, and simply involves " +
                    "choosing the name you would like, and committing it into a transaction that you later refer to when creating an identity."}
                </div>
              </React.Fragment>
            )}
            {Object.keys(this.props.activatedCoins).map(
              (chainTicker, index) => {
                const {
                  identityErrors,
                  getInfoErrors,
                  activatedCoins
                } = this.props;
                if (activatedCoins[chainTicker].options.tags.includes(IS_VERUS)) {
                  const identityError =
                    identityErrors[chainTicker] != null
                      ? identityErrors[chainTicker].error
                      : false;
                  const identityErrorMsg =
                    identityErrors[chainTicker] != null
                      ? identityErrors[chainTicker].result
                      : null;
                  const infoError =
                    getInfoErrors[chainTicker] != null
                      ? getInfoErrors[chainTicker].error
                      : false;
                  const infoErrorMsg =
                    getInfoErrors[chainTicker] != null
                      ? getInfoErrors[chainTicker].result
                      : null;

                  return identityError || infoError ? (
                    <div style={{ marginTop: 5 }} key={index}>
                      <i
                        className="fas fa-exclamation-triangle"
                        style={{
                          marginRight: 6,
                          color: "rgb(236,124,43)",
                          fontSize: 18
                        }}
                      />
                      <span>{`Warning, ${chainTicker} IDs not loaded: `}</span>
                      <span
                        style={{
                          color: "rgb(236,124,43)",
                          fontWeight: "bold"
                        }}
                      >
                        {infoError ? infoErrorMsg : identityErrorMsg}
                      </span>
                    </div>
                  ) : null;
                } else return null;
              }
            )}
          </div>
        </div>
      </WalletPaper>
      {DashboardRenderIds.call(this)}
    </div>
  );
}

export const DashboardRenderTable = function() {
  return (
    <div className="table-responsive" style={{ maxHeight: 600, overflowY: "scroll" }}>
      <table className="table table-striped">
        <thead>
          <tr />
        </thead>
        <tbody>
          {this.state.displayNameCommitments.map((reservationObj, index) => {
            const { namereservation, chainTicker } = reservationObj
            const { identities, transactions } = this.props
            let isUsed = false
            let loading = false
            let failed = reservationObj.confirmations < 0 ? true : false
            
            if (identities[chainTicker] && transactions[chainTicker]) {
              if (!(identities[chainTicker].every(idObj => {
                return idObj.identity.identityaddress !== namereservation.nameid
              }))) {
                isUsed = true
              } else {
                for (let i = 0; i < transactions[chainTicker].length; i++) {
                  const tx = transactions[chainTicker][i]
  
                  if (tx.address === namereservation.nameid) {
                    const { confirmations } = tx
                    // If confirmation < 0, mark as "ready" to be used again
                    if (confirmations === 0) {
                      failed = false
                      loading = true
                      break;
                    } else if (confirmations > 0) {
                      failed = false
                      isUsed = true
                      break;
                    } else {
                      failed = true
                    }
                  }
                }
              }
            } else {
              loading = true
            }

            return (
              <tr
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <td
                  style={{
                    color: "rgb(0,0,0)",
                    fontWeight: "bold",
                    borderTop: 0,
                  }}
                >
                  {`${namereservation.name}${
                    chainTicker === "VRSC" || chainTicker === "VRSCTEST"
                      ? ""
                      : `.${chainTicker}`
                  }@`}
                </td>
                <td style={{ borderTop: 0 }}>
                  <h3
                    className={`d-lg-flex align-items-lg-center coin-type ${
                      reservationObj.confirmations == null || isUsed || loading
                        ? "native"
                        : failed
                        ? "red"
                        : reservationObj.confirmations > 0
                        ? "green"
                        : "lite"
                    }`}
                    style={{
                      fontSize: 12,
                      width: "min-content",
                      padding: 4,
                      paddingTop: 1,
                      paddingBottom: 1,
                      borderWidth: 1,
                      margin: 0,
                    }}
                  >
                    {loading
                      ? "Loading..."
                      : isUsed
                      ? "Used"
                      : failed
                      ? "Failed"
                      : reservationObj.confirmations != null &&
                        reservationObj.confirmations > 0
                      ? "Ready"
                      : "Pending..."}
                  </h3>
                </td>
                <td style={{ borderTop: 0 }}>
                  {
                    <a
                      className="card-link text-right"
                      href={
                        reservationObj.confirmations == null ||
                        reservationObj.confirmations == 0 ||
                        loading
                          ? undefined
                          : "#"
                      }
                      style={{
                        fontSize: 14,
                        color:
                          reservationObj.confirmations == null ||
                          reservationObj.confirmations == 0 ||
                          loading
                            ? "rgb(0,0,0)"
                            : "rgb(49, 101, 212)",
                      }}
                      onClick={
                        failed
                          ? () =>
                              this.openCommitNameModal(chainTicker, {
                                name: namereservation.name,
                                referralId: namereservation.referral,
                              })
                          : reservationObj.confirmations == null ||
                            reservationObj.confirmations == 0 ||
                            loading
                          ? () => {
                              return 0;
                            }
                          : isUsed
                          ? () =>
                              this.deleteNameCommitment(
                                namereservation.name,
                                chainTicker
                              )
                          : () => this.openRegisterIdentityModal(reservationObj)
                      }
                    >
                      {loading
                        ? "Loading..."
                        : isUsed
                        ? "Untrack name commitment"
                        : failed
                        ? "Try again"
                        : reservationObj.confirmations != null &&
                          reservationObj.confirmations > 0
                        ? "Create Verus ID"
                        : "Waiting for confirmation..."}
                    </a>
                  }
                </td>
                <td style={{ borderTop: 0 }}>
                  <Tooltip title="Untrack">
                    <IconButton
                      size="small"
                      aria-label="Untrack Name Commitment"
                      onClick={() =>
                        this.deleteNameCommitment(
                          namereservation.name,
                          chainTicker
                        )
                      }
                    >
                      <DeleteForever />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export const DashboardRevokeDialogue = function() {
  const { revokeDialogueOpen, revokeId } = this.state
  const { identity, chainTicker } = revokeId

  return (
    <Dialog
      open={revokeDialogueOpen == null ? false : revokeDialogueOpen}
      onClose={this.closeRevokeDialogue}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{`Revoke ID?`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {`Are you sure you would like to revoke ${
            identity.name
            }@ (${identity.identityaddress})? This will cost one transaction fee (0.0001 ${
              chainTicker
              }), and will prevent ${
                identity.name
                }@ from being able to be used until it is recovered.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.closeRevokeDialogue} color="primary">
          {"No"}
        </Button>
        <Button
          onClick={() => this.revokeId(chainTicker, identity.identityaddress)}
          disabled={!identity.identityaddress}
          color="primary"
          autoFocus
        >
          {"Yes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const DashboardRenderIds = function() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "-0.516%",
        marginRight: "-0.516%"
      }}
    >
      {this.state.compiledIds.map((idObj, index) => {
        const { identity, chainTicker } = idObj;
        const selectedCurrency = this.props.selectedCurrencyMap[chainTicker]
          ? this.props.selectedCurrencyMap[chainTicker]
          : chainTicker;
        const zBalance =
          idObj.balances.native.private.confirmed == null || selectedCurrency !== chainTicker
            ? 0
            : idObj.balances.native.private.confirmed;
        const tBalance =
          selectedCurrency === chainTicker
            ? idObj.balances.native.public.confirmed
            : idObj.balances.reserve[selectedCurrency] != null
            ? idObj.balances.reserve[selectedCurrency]
            : 0;

        const spendableBalance = Number(
          (Number(tBalance) + Number(zBalance)).toFixed(8)
        );

        const isTimelockDelay = checkFlag(identity.flags, TIMELOCK_DELAY_FLAG);
        const longestchain =
          this.props.info[chainTicker] && this.props.info[chainTicker].longestchain
            ? this.props.info[chainTicker].longestchain
            : 0;
        const isLocked = identity.timelock > longestchain || isTimelockDelay

        const numOffers = idObj.offers ? Object.values(idObj.offers).flat().length : 0;

        return (
          <WalletPaper
            style={{
              width: "32.3%",
              minWidth: 255,
              margin: "0.516%",
              marginTop: 0,
              marginBottom: "1.032%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            key={index}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={`assets/images/idThumbnail.png`} width="50px" height="50px" />
              <div style={{ paddingLeft: 10, overflow: "hidden" }}>
                <a
                  className="d-lg-flex align-items-lg-center"
                  style={{
                    fontSize: 16,
                    color: "rgb(49, 101, 212)",
                    fontWeight: "bold",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                  }}
                  href={"#"}
                  onClick={() => copyDataToClipboard(`${identity.name}@`)}
                >
                  {`${identity.name}@`}
                </a>
                <div style={{ display: "flex" }}>
                  <h3
                    className={`d-lg-flex align-items-lg-center coin-type ${
                      idObj.status === ID_REVOKED ? "red" : "native"
                    }`}
                    style={{
                      fontSize: 12,
                      width: "max-content",
                      padding: 4,
                      paddingTop: 1,
                      paddingBottom: 1,
                      borderWidth: 1,
                    }}
                  >
                    {idObj.status === ID_REVOKED
                      ? "revoked"
                      : idObj.canspendfor
                      ? "can spend"
                      : idObj.cansignfor
                      ? "can sign"
                      : "can't sign/spend"}
                  </h3>
                  {numOffers > 0 && (
                    <h3
                      className={`d-lg-flex align-items-lg-center coin-type green`}
                      style={{
                        fontSize: 12,
                        width: "max-content",
                        padding: 4,
                        paddingTop: 1,
                        paddingBottom: 1,
                        borderWidth: 1,
                        marginLeft: 3,
                      }}
                    >
                      {`${numOffers} offer${numOffers === 1 ? "" : "s"}`}
                    </h3>
                  )}
                  {isLocked && (
                    <h3
                      className={`d-lg-flex align-items-lg-center coin-type green`}
                      style={{
                        fontSize: 12,
                        width: "max-content",
                        padding: 4,
                        paddingTop: 1,
                        paddingBottom: 1,
                        borderWidth: 1,
                        marginLeft: 3,
                      }}
                    >
                      {"locked"}
                    </h3>
                  )}
                  {isLocked && !isTimelockDelay && (
                    <h3
                      className={`d-lg-flex align-items-lg-center coin-type lite`}
                      style={{
                        fontSize: 12,
                        width: "max-content",
                        padding: 4,
                        paddingTop: 1,
                        paddingBottom: 1,
                        borderWidth: 1,
                        marginLeft: 3,
                      }}
                    >
                      {"will unlock"}
                    </h3>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ paddingTop: 30 }}>
                <h3 style={{ fontSize: 14, color: "rgb(20,20,20)" }}>{"Balance:"}</h3>
                <h3
                  style={{
                    fontSize: 16,
                    color: "rgb(0,0,0)",
                    marginBottom: 0,
                  }}
                >
                  {`${spendableBalance} ${selectedCurrency}`}
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flex: 1,
                  flexWrap: "wrap",
                }}
              >
                {numOffers > 0 && (
                  <Tooltip title={numOffers === 1 ? "See offer" : "See offers"}>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() =>
                        openIdentityCard(idObj, idObj.chainTicker, IDENTITY_OFFERS_TAB)
                      }
                      style={{
                        fontSize: 10,
                        backgroundColor: "rgb(74, 166, 88)",
                        borderWidth: 1,
                        borderColor: "rgb(74, 166, 88)",
                        fontWeight: "bold",
                        marginTop: 3,
                      }}
                    >
                      <SwapHoriz />
                    </button>
                  </Tooltip>
                )}
                {idObj.canrevoke && (
                  <Tooltip title="Revoke">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => this.openRevokeDialogue(idObj)}
                      style={{
                        fontSize: 10,
                        backgroundColor: "rgb(212, 49, 62)",
                        borderWidth: 1,
                        borderColor: "rgb(212, 49, 62)",
                        fontWeight: "bold",
                        marginTop: 3,
                      }}
                    >
                      <Block />
                    </button>
                  </Tooltip>
                )}
                {idObj.canrecover && (
                  <Tooltip title="Recover">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() =>
                        this.openRecoverIdModal(idObj.chainTicker, {
                          primaryAddress: identity.primaryaddresses[0], // TODO: Add support for multisig
                          revocationId: identity.revocationauthority,
                          recoveryId: identity.recoveryauthority,
                          privateAddr: identity.privateaddress,
                          name: identity.identityaddress || "",
                        })
                      }
                      style={{
                        fontSize: 10,
                        backgroundColor: "rgb(74, 166, 88)",
                        borderWidth: 1,
                        borderColor: "rgb(74, 166, 88)",
                        fontWeight: "bold",
                        marginTop: 3,
                      }}
                    >
                      <SettingsBackupRestoreIcon />
                    </button>
                  </Tooltip>
                )}
                <Tooltip title="Open">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => this.openId(idObj.chainTicker, idObj.index)}
                    style={{
                      fontSize: 10,
                      backgroundColor: "#2f65d0",
                      borderWidth: 1,
                      marginLeft: 3,
                      borderColor: "#2f65d0",
                      fontWeight: "bold",
                      marginTop: 3,
                    }}
                  >
                    <OpenInNewIcon />
                  </button>
                </Tooltip>
              </div>
            </div>
          </WalletPaper>
        );
      })}
    </div>
  );
}


