import React from 'react';
import { connect } from 'react-redux';
import {
  GiftCardsRender,
} from './giftCards.render';
import {
  GIFT_CARD,
  CREATE_GIFT_CARD,
  FUND_GIFT_CARD,
  API_SUCCESS,
  GIFT_CARD_REFRESH_INTERVAL_MS
} from "../../../../../util/constants/componentConstants";
import {
  openModal,
  openTextDialog,
  closeTextDialog,
  getSavedGiftCard,
  saveGiftCard,
  saveGiftCardIfUnchanged,
  removeGiftCardIfUnchanged
} from '../../../../../actions/actionDispatchers';
import {
  canDeleteGiftCard,
  canStartGiftCardFunding,
  getRefreshComparableCard,
  hasGiftCardBeenRedeemed,
  hasGiftCardBeenShared,
  hasGiftCardClaims,
  hasGiftCardMempoolTransactions,
  hasPendingGiftCardFunding,
  markGiftCardShared,
  refreshGiftCardStatus
} from '../../../../../util/giftCardUtils';
import { redeemSpendableKey } from '../../../../../util/api/wallet/walletCalls';
import { copyDataToClipboard } from '../../../../../util/copyToClipboard';

class GiftCards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createDropdownOpen: false,
      busyCards: {},
      shareCardTarget: null,
      qrCard: null
    }

    this.refreshAllRunning = false
    //this.refreshInterval = null

    this.handleClick = this.handleClick.bind(this)
    this.toggleCreateDropdown = this.toggleCreateDropdown.bind(this)
    this.openCreateGiftCardModal = this.openCreateGiftCardModal.bind(this)
    this.showAlert = this.showAlert.bind(this)
    this.setCardBusy = this.setCardBusy.bind(this)
    this.refreshAllCards = this.refreshAllCards.bind(this)
    this.refreshCard = this.refreshCard.bind(this)
    this.explainFundUnavailable = this.explainFundUnavailable.bind(this)
    this.fundCard = this.fundCard.bind(this)
    this.cancelCard = this.cancelCard.bind(this)
    this.openCancelFlow = this.openCancelFlow.bind(this)
    this.redeemCard = this.redeemCard.bind(this)
    this.deleteCard = this.deleteCard.bind(this)
    this.confirmDeleteCard = this.confirmDeleteCard.bind(this)
    this.explainDeleteUnavailable = this.explainDeleteUnavailable.bind(this)
    this.shareCard = this.shareCard.bind(this)
    this.closeShareDialog = this.closeShareDialog.bind(this)
    this.closeQrDialog = this.closeQrDialog.bind(this)
    this.markCardSharedForAction = this.markCardSharedForAction.bind(this)
    this.runShareAction = this.runShareAction.bind(this)
    this.shareQr = this.shareQr.bind(this)
    this.shareCopy = this.shareCopy.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false)

    this.refreshAllCards()
    //this.refreshInterval = setInterval(this.refreshAllCards, GIFT_CARD_REFRESH_INTERVAL_MS)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
    //clearInterval(this.refreshInterval)
  }

  handleClick(e) {
    if (this.createDropdownMenu.contains(e.target)) return;
    else this.setState({ createDropdownOpen: false });
  }

  toggleCreateDropdown() {
    this.setState({ createDropdownOpen: !this.state.createDropdownOpen })
  }

  openCreateGiftCardModal(chainTicker) {
    openModal(GIFT_CARD, { modalType: CREATE_GIFT_CARD, chainTicker })
  }

  showAlert(title, message) {
    openTextDialog(closeTextDialog, [{ title: "OK", onClick: closeTextDialog }], message, title)
  }

  setCardBusy(address, busy) {
    this.setState(state => ({ busyCards: { ...state.busyCards, [address]: busy } }))
  }

  async refreshAllCards() {
    const giftCards = Object.values(this.props.giftCards || {})

    if (giftCards.length === 0 || this.refreshAllRunning) return

    this.refreshAllRunning = true

    try {
      for (const giftCard of giftCards) {
        try {
          const refreshed = await refreshGiftCardStatus(giftCard)

          if (getRefreshComparableCard(refreshed) !== getRefreshComparableCard(giftCard)) {
            await saveGiftCardIfUnchanged(giftCard, refreshed)
          }
        } catch (e) {
          console.warn(e.message)
        }
      }
    } finally {
      this.refreshAllRunning = false
    }
  }

  async refreshCard(giftCard) {
    this.setCardBusy(giftCard.address, true)

    try {
      const refreshed = await refreshGiftCardStatus(giftCard)
      const savedCard = await saveGiftCardIfUnchanged(giftCard, refreshed)

      return savedCard || refreshed
    } catch (e) {
      console.error(e)
      this.showAlert("Network Error", e.message || "Unable to refresh gift card.")
      throw e
    } finally {
      this.setCardBusy(giftCard.address, false)
    }
  }

  explainFundUnavailable(giftCard) {
    if (hasPendingGiftCardFunding(giftCard)) {
      this.showAlert(
        "Pending Funding",
        "Wait for pending funding transactions to confirm before adding more funds."
      )
    } else if (hasGiftCardBeenRedeemed(giftCard)) {
      this.showAlert("Redeemed", "Redeemed gift cards cannot be funded.")
    } else if (hasGiftCardBeenShared(giftCard) && !canStartGiftCardFunding(giftCard)) {
      this.showAlert(
        "Single-use Gift Card",
        "This shared gift card already has funds or a recorded funding attempt. Create a new gift card instead of funding it again."
      )
    } else return false

    return true
  }

  async fundCard(giftCard) {
    if (this.explainFundUnavailable(giftCard)) return

    try {
      const refreshed = await this.refreshCard(giftCard)

      if (this.explainFundUnavailable(refreshed)) return

      openModal(GIFT_CARD, {
        modalType: FUND_GIFT_CARD,
        chainTicker: refreshed.chainTicker,
        address: refreshed.address
      })
    } catch (e) {}
  }

  async cancelCard(giftCard) {
    const pendingMessage =
      "Wait for pending funding transactions to confirm before canceling this gift card."

    if (hasPendingGiftCardFunding(giftCard)) {
      this.showAlert("Pending Funding", pendingMessage)
      return
    }

    try {
      const refreshed = await this.refreshCard(giftCard)

      if (hasPendingGiftCardFunding(refreshed)) {
        this.showAlert("Pending Funding", pendingMessage)
        return
      }

      if (!hasGiftCardClaims(refreshed)) {
        this.showAlert("Empty Gift Card", "This gift card has no funds or VerusIDs to redeem.")
        return
      }

      this.openCancelFlow(refreshed)
    } catch (e) {}
  }

  openCancelFlow(giftCard) {
    openTextDialog(
      closeTextDialog,
      [
        {
          title: "Back",
          onClick: closeTextDialog
        },
        {
          title: "Redeem",
          onClick: () => {
            closeTextDialog()
            this.redeemCard(giftCard)
          }
        }
      ],
      "Redeem this gift card to your own wallet to cancel it and make the shared link unspendable.",
      "Cancel Gift Card"
    )
  }

  // Redeeming runs in the login consent window, the same as claiming any other gift card link
  async redeemCard(giftCard) {
    this.setCardBusy(giftCard.address, true)

    try {
      const redeemRes = await redeemSpendableKey(giftCard.chainTicker, giftCard.uri)

      if (redeemRes.msg !== API_SUCCESS) throw new Error(redeemRes.result)
    } catch (e) {
      console.error(e)
      this.showAlert("Unable to Redeem", e.message)
    } finally {
      this.setCardBusy(giftCard.address, false)
      this.refreshAllCards()
    }
  }

  async deleteCard(giftCard) {
    this.setCardBusy(giftCard.address, true)

    try {
      const refreshed = await refreshGiftCardStatus(giftCard)

      if (!canDeleteGiftCard(refreshed)) {
        await saveGiftCardIfUnchanged(giftCard, refreshed)
        this.showAlert(
          "Cannot Delete",
          "This gift card still has funds, VerusIDs, pending funding, or could not be fully checked."
        )
        return
      }

      if (hasGiftCardMempoolTransactions(refreshed)) {
        await saveGiftCardIfUnchanged(giftCard, refreshed)
        this.showAlert(
          "Cannot Delete",
          "This gift card has a pending transaction in the mempool. Wait for it to confirm, then refresh the card before deleting it."
        )
        return
      }

      if (!(await removeGiftCardIfUnchanged(giftCard))) {
        this.showAlert(
          "Cannot Delete",
          "This gift card changed while deletion checks were running. Refresh it and try again."
        )
      }
    } catch (e) {
      console.error(e)
      this.showAlert(
        "Unable to Delete",
        e.message || "Unable to verify that this gift card can be deleted."
      )
    } finally {
      this.setCardBusy(giftCard.address, false)
    }
  }

  confirmDeleteCard(giftCard) {
    if (!canDeleteGiftCard(giftCard)) return

    openTextDialog(
      closeTextDialog,
      [
        {
          title: "Cancel",
          onClick: closeTextDialog
        },
        {
          title: "Delete",
          onClick: () => {
            closeTextDialog()
            this.deleteCard(giftCard)
          }
        }
      ],
      hasGiftCardBeenRedeemed(giftCard)
        ? "Are you sure you want to delete this gift card from this device?"
        : "Are you sure you want to delete this gift card from this device? If there are any pending funds coming to the card, they will be permanently lost if the card is deleted.",
      "Delete Gift Card"
    )
  }

  explainDeleteUnavailable(giftCard) {
    if (hasPendingGiftCardFunding(giftCard)) {
      this.showAlert(
        "Cannot Delete",
        "This gift card has pending funding transactions. Refresh after they confirm before deleting it."
      )
    } else if (hasGiftCardClaims(giftCard)) {
      this.showAlert(
        "Cannot Delete",
        "This gift card still has funds or VerusIDs. Redeem or empty it, then refresh before deleting it."
      )
    } else {
      this.showAlert("Cannot Delete", "Refresh the gift card status before deleting it.")
    }
  }

  shareCard(giftCard) {
    this.setState({ shareCardTarget: giftCard.address })
  }

  closeShareDialog() {
    this.setState({ shareCardTarget: null })
  }

  closeQrDialog() {
    this.setState({ qrCard: null })
  }

  async markCardSharedForAction(giftCard) {
    if (hasGiftCardBeenShared(giftCard)) return giftCard

    const currentCard = getSavedGiftCard(giftCard.address)

    if (currentCard == null) throw new Error("Gift card is no longer available.")

    return await saveGiftCard(markGiftCardShared(currentCard))
  }

  async runShareAction(giftCard, action) {
    this.setState({ shareCardTarget: null })
    this.setCardBusy(giftCard.address, true)

    try {
      action(await this.markCardSharedForAction(giftCard))
    } catch (e) {
      console.error(e)
      this.showAlert("Unable to Share", e.message || "Unable to share gift card.")
    } finally {
      this.setCardBusy(giftCard.address, false)
    }
  }

  shareQr(giftCard) {
    this.runShareAction(giftCard, sharedCard => this.setState({ qrCard: sharedCard.address }))
  }

  shareCopy(giftCard) {
    this.runShareAction(giftCard, sharedCard =>
      copyDataToClipboard(sharedCard.uri, "Gift card link copied to clipboard.")
    )
  }

  render() {
    return GiftCardsRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    activatedCoins: state.coins.activatedCoins,
    giftCards: state.users.activeUser.giftCards
  };
};

export default connect(mapStateToProps)(GiftCards);
