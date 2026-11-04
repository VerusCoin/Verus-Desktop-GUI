import React from 'react';
import { IS_VERUS, NATIVE } from '../../../../../util/constants/componentConstants';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import DialogContentText from '@material-ui/core/DialogContentText';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteForever from '@material-ui/icons/DeleteForever';
import QRCode from 'qrcode.react';
import WalletPaper from '../../../../../containers/WalletPaper/WalletPaper';
import ContentDialog from '../../../../../containers/ContentDialog/ContentDialog';
import { openAddCoinModal } from '../../../../../actions/actionDispatchers';
import { copyDataToClipboard } from '../../../../../util/copyToClipboard';
import {
  canDeleteGiftCard,
  getClaimedByLabel,
  getGiftCardClaimInfo,
  getGiftCardPendingFundings,
  getStatusLabel,
  hasGiftCardBeenRedeemed,
  hasGiftCardBeenShared,
  hasGiftCardClaims,
  hasGiftCardIdentityLookupError,
  needsUnfundedShareWarning
} from '../../../../../util/giftCardUtils';

export const GiftCardsRender = function() {
  const verusProtocolCoins = Object.values(this.props.activatedCoins).filter((coinObj) => {
    return coinObj.options.tags.includes(IS_VERUS) && coinObj.mode === NATIVE
  })
  const giftCards = Object.values(this.props.giftCards || {}).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div
      className="col-md-8 col-lg-9"
      style={{ padding: 16, overflow: "scroll" }}
    >
      {GiftCardsShareDialogue.call(this)}
      {GiftCardsQrDialogue.call(this)}
      <WalletPaper style={{ marginBottom: 16 }}>
        <h6
          className="card-title"
          style={{ fontSize: 14, margin: 0, width: "100%" }}
        >
          {"Gift Cards"}
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
                this.state.createDropdownOpen ? "show" : ""
              }`}
              ref={node => (this.createDropdownMenu = node)}
              style={{
                marginBottom: 5,
                width: "100%"
              }}
            >
              <button
                className="btn btn-primary"
                type="button"
                onClick={
                  verusProtocolCoins.length === 1
                    ? () => this.openCreateGiftCardModal(verusProtocolCoins[0].id)
                    : this.toggleCreateDropdown
                }
                disabled={verusProtocolCoins.length === 0}
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
                <strong>{"Create Gift Card"}</strong>
              </button>
              <div
                className={`dropdown-menu ${
                  this.state.createDropdownOpen ? "show" : ""
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
                  return (
                    <a
                      className="dropdown-item"
                      key={index}
                      role="presentation"
                      href="#"
                      onClick={() => this.openCreateGiftCardModal(coinObj.id)}
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
              justifyContent: "center",
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
                    "Add a Verus protocol coin (VRSC or VRSCTEST) to create gift cards!"
                  }
                </a>
              </div>
            ) : giftCards.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                {"No gift cards have been created for this profile."}
              </div>
            ) : null}
          </div>
        </div>
      </WalletPaper>
      {GiftCardsRenderCards.call(this, giftCards)}
    </div>
  );
}

export const GiftCardsRenderCards = function(giftCards) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        marginLeft: "-0.516%",
        marginRight: "-0.516%"
      }}
    >
      {giftCards.map(giftCard => GiftCardsRenderCard.call(this, giftCard))}
    </div>
  )
}

export const GiftCardsRenderCard = function(giftCard) {
  const busy = this.state.busyCards[giftCard.address] === true
  const pendingFundings = getGiftCardPendingFundings(giftCard)
  const pending = pendingFundings.length > 0
  const hasClaims = hasGiftCardClaims(giftCard)
  const deleteEnabled = canDeleteGiftCard(giftCard)
  const claimInfo = getGiftCardClaimInfo(giftCard)
  const status = giftCard.status || {}
  const buttonStyle = {
    fontSize: 12,
    backgroundColor: "rgb(49, 101, 212)",
    borderWidth: 1,
    borderColor: "rgb(49, 101, 212)",
    fontWeight: "bold",
    marginRight: 3
  }

  return (
    <WalletPaper
      key={giftCard.address}
      style={{
        width: "32.3%",
        minWidth: 255,
        margin: "0.516%",
        marginTop: 0,
        marginBottom: "1.032%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <i className="fas fa-gift" style={{ fontSize: 32, color: "rgb(49, 101, 212)" }} />
          <div style={{ paddingLeft: 10, overflow: "hidden", flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                color: "rgb(49, 101, 212)",
                fontWeight: "bold",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
              }}
            >
              {giftCard.label}
            </div>
            <div style={{ fontSize: 12, color: "rgb(0,0,0)" }}>
              {`${getStatusLabel(giftCard)}${giftCard.encrypted ? " • encrypted" : ""}${
                hasGiftCardBeenShared(giftCard) ? " • shared" : ""
              } • ${new Date(giftCard.createdAt).toLocaleDateString()}`}
            </div>
          </div>
          {busy ? (
            <CircularProgress
              variant={"indeterminate"}
              thickness={4.5}
              size={20}
              style={{ margin: 5 }}
            />
          ) : (
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                aria-label="Refresh gift card"
                onClick={() => this.refreshCard(giftCard).catch(() => {})}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 12, marginTop: 8 }}>
          <div style={{ overflowWrap: "anywhere", flex: 1 }}>{giftCard.address}</div>
          <IconButton
            size="small"
            aria-label="Copy gift card address"
            onClick={() => copyDataToClipboard(giftCard.address)}
          >
            <FileCopyIcon fontSize="small" />
          </IconButton>
        </div>
        {claimInfo != null && (
          <div
            style={{
              backgroundColor: "rgb(243,250,247)",
              border: "1px solid rgb(74,166,88)",
              borderRadius: 8,
              marginTop: 8,
              padding: 10,
              fontSize: 12,
              color: "rgb(0,0,0)"
            }}
          >
            <div>
              <i className="fas fa-user-check" style={{ paddingRight: 6, color: "rgb(74,166,88)" }} />
              {`Claimed by ${getClaimedByLabel(claimInfo)}`}
            </div>
            <div style={{ marginTop: 4 }}>
              {claimInfo.claimedAt
                ? `Claimed at ${new Date(claimInfo.claimedAt).toLocaleString()}`
                : claimInfo.height
                ? `Claimed at block ${claimInfo.height}`
                : "Claim time unavailable"}
            </div>
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 14, color: "rgb(0,0,0)" }}>
          {hasClaims ? (
            <React.Fragment>
              <div style={{ fontWeight: "bold" }}>{giftCard.chainTicker}</div>
              {(status.currencies || []).map(currency => (
                <div key={currency.currencyId}>{`${currency.amount} ${currency.name || currency.currencyId}`}</div>
              ))}
              {(status.identities || []).map(identity => (
                <div key={identity.identityAddress}>
                  {identity.fullyQualifiedName || identity.identityAddress}
                </div>
              ))}
            </React.Fragment>
          ) : claimInfo == null ? (
            <div>
              {hasGiftCardIdentityLookupError(giftCard)
                ? "VerusID lookup unavailable. ID-only cards funded outside this wallet need a daemon started with -idindex=1."
                : "No funds or VerusIDs found."}
            </div>
          ) : null}
        </div>
        {pending && (
          <div
            style={{
              backgroundColor: "rgb(255,244,232)",
              border: "1px solid rgb(236,124,43)",
              borderRadius: 8,
              marginTop: 12,
              padding: 10,
              fontSize: 12,
              color: "rgb(0,0,0)"
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 6 }}>{"Pending funding"}</div>
            {pendingFundings.map((entry, entryIndex) => (
              <div key={entryIndex}>
                {(entry.identities || []).map(identity => (
                  <div key={`${entryIndex}:${identity.identityAddress}`} style={{ marginTop: 2 }}>
                    {`Waiting for ${identity.fullyQualifiedName || identity.identityAddress}`}
                  </div>
                ))}
                {(entry.txids || []).map(txid => (
                  <div
                    key={`${entryIndex}:${txid}`}
                    style={{ display: "flex", alignItems: "center", marginTop: 4 }}
                  >
                    <div style={{ overflowWrap: "anywhere", flex: 1 }}>{txid}</div>
                    <IconButton
                      size="small"
                      aria-label="Copy transaction ID"
                      onClick={() => copyDataToClipboard(txid, "Transaction ID copied to clipboard.")}
                    >
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
        <button
          className="btn btn-primary"
          type="button"
          disabled={hasGiftCardBeenRedeemed(giftCard) || pending || busy}
          onClick={() => this.fundCard(giftCard)}
          style={buttonStyle}
        >
          {"Fund"}
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={busy || pending || !hasClaims}
          onClick={() => this.cancelCard(giftCard)}
          style={buttonStyle}
        >
          {"Cancel"}
        </button>
        <button
          className="btn btn-primary"
          type="button"
          disabled={busy}
          onClick={() => this.shareCard(giftCard)}
          style={buttonStyle}
        >
          {"Share"}
        </button>
        <div style={{ flex: 1 }} />
        <Tooltip title="Delete">
          <span>
            <IconButton
              size="small"
              aria-label="Delete gift card"
              disabled={busy}
              onClick={() =>
                deleteEnabled
                  ? this.confirmDeleteCard(giftCard)
                  : this.explainDeleteUnavailable(giftCard)
              }
              style={{
                color: deleteEnabled ? "rgb(212, 49, 62)" : undefined,
                opacity: deleteEnabled ? 1 : 0.45
              }}
            >
              <DeleteForever />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </WalletPaper>
  );
}

export const GiftCardsShareDialogue = function() {
  const giftCard =
    this.state.shareCardTarget != null
      ? (this.props.giftCards || {})[this.state.shareCardTarget]
      : null

  return (
    <ContentDialog
      open={giftCard != null}
      onCancel={this.closeShareDialog}
      actions={[{ title: "Cancel", onClick: this.closeShareDialog }]}
      title="Share Gift Card"
    >
      {giftCard != null && (
        <React.Fragment>
          <DialogContentText>
            {"Sharing exposes the spendable gift-card key. Anyone with this key can spend the card."}
          </DialogContentText>
          {needsUnfundedShareWarning(giftCard) && (
            <div
              style={{
                backgroundColor: "rgb(255,244,232)",
                border: "1px solid rgb(236,124,43)",
                borderRadius: 8,
                marginBottom: 12,
                padding: 10
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                <i
                  className="fas fa-exclamation-triangle"
                  style={{ paddingRight: 6, color: "rgb(236,124,43)" }}
                />
                {"Unfunded gift card"}
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                {"Anyone who gets the key can spend funds as soon as they arrive. Treat this card as single-use and fund it only once."}
              </div>
            </div>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => this.shareQr(giftCard)}
            style={{ marginBottom: 8 }}
          >
            {"QR Code"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => this.shareCopy(giftCard)}
          >
            {"Copy Link"}
          </Button>
        </React.Fragment>
      )}
    </ContentDialog>
  );
}

export const GiftCardsQrDialogue = function() {
  const giftCard =
    this.state.qrCard != null ? (this.props.giftCards || {})[this.state.qrCard] : null

  return (
    <ContentDialog
      open={giftCard != null}
      onCancel={this.closeQrDialog}
      actions={[{ title: "Close", onClick: this.closeQrDialog }]}
      title="Gift Card QR"
    >
      {giftCard != null && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <DialogContentText>{giftCard.label}</DialogContentText>
          <QRCode value={giftCard.uri} size={256} />
        </div>
      )}
    </ContentDialog>
  );
}
