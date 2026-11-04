import React from 'react';
import { connect } from 'react-redux';
import {
  GiftCardRender
} from './giftCard.render';
import {
  ENTER_DATA,
  CONFIRM_DATA,
  API_SUCCESS,
  ERROR_SNACK,
  API_ERROR,
  SUCCESS_SNACK,
  GIFT_CARD,
  CREATE_GIFT_CARD,
  FUND_GIFT_CARD,
  MID_LENGTH_ALERT,
  LONG_ALERT,
  API_GET_BALANCES,
  API_GET_TRANSACTIONS,
  API_GET_IDENTITIES
} from "../../../util/constants/componentConstants";
import { createSpendableKey, fundSpendableKey } from '../../../util/api/wallet/walletCalls';
import { newSnackbar, expireData } from '../../../actions/actionCreators';
import { getSavedGiftCard, saveGiftCard } from '../../../actions/actionDispatchers';
import {
  addGiftCardPendingFunding,
  canStartGiftCardFunding,
  getNewGiftCard,
  hasGiftCardBeenRedeemed,
  hasGiftCardBeenShared
} from '../../../util/giftCardUtils';

class GiftCard extends React.Component {
  constructor(props) {
    super(props);
    const { chainTicker } = props.modalProps

    switch (props.modalProps.modalType) {
      case CREATE_GIFT_CARD:
        props.setModalHeader(`Create ${chainTicker} Gift Card`)
        break;
      case FUND_GIFT_CARD:
        props.setModalHeader("Fund Gift Card")
        break;
      default:
        break;
    }

    this.state = {
      formStep: ENTER_DATA,
      txData: {},
      loading: false,
      loadingProgress: 0,
      formData: {},
      continueDisabled: true
    }

    this.advanceFormStep = this.advanceFormStep.bind(this)
    this.getFormData = this.getFormData.bind(this)
    this.back = this.back.bind(this)
    this.getContinueDisabled = this.getContinueDisabled.bind(this)
    this.saveNewGiftCard = this.saveNewGiftCard.bind(this)
    this.loadLatestFundableCard = this.loadLatestFundableCard.bind(this)
    this.saveFundingResult = this.saveFundingResult.bind(this)
  }

  getFormData(formData) {
    this.setState({ formData })
  }

  getContinueDisabled(continueDisabled) {
    this.setState({ continueDisabled })
  }

  back() {
    this.setState({
      formStep: ENTER_DATA,
      txData: {}
    })
  }

  async saveNewGiftCard(createResult) {
    const { label } = this.state.formData
    const { chainTicker } = this.props.modalProps

    try {
      await saveGiftCard(getNewGiftCard(chainTicker, label, createResult))
    } catch (e) {
      this.props.dispatch(newSnackbar(ERROR_SNACK, `Gift card created, but the profile could not be saved: ${e.message}`))
    }
  }

  // Read the saved card again right before building or sending, as a shared card can only be funded once
  loadLatestFundableCard() {
    const giftCard = getSavedGiftCard(this.props.modalProps.address)

    if (giftCard == null) throw new Error("Gift card is no longer available.")

    if (hasGiftCardBeenRedeemed(giftCard) || !canStartGiftCardFunding(giftCard)) {
      throw new Error(
        hasGiftCardBeenShared(giftCard)
          ? "This gift card cannot be funded again. Shared gift cards are single-use once funds or a funding attempt have been recorded."
          : "Redeemed gift cards cannot be funded."
      )
    }

    return giftCard
  }

  async saveFundingResult(fundingResult) {
    const { chainTicker, address } = this.props.modalProps

    try {
      const giftCard = getSavedGiftCard(address)

      if (giftCard == null) throw new Error("Gift card is no longer available.")

      await saveGiftCard(addGiftCardPendingFunding(giftCard, fundingResult))

      if (fundingResult.partialError == null) {
        this.props.dispatch(
          newSnackbar(
            SUCCESS_SNACK,
            "Gift card funding transactions were submitted and saved as pending.",
            MID_LENGTH_ALERT
          )
        )
      }
    } catch (e) {
      this.props.dispatch(
        newSnackbar(
          ERROR_SNACK,
          `Some funding transactions were submitted, but the app could not save them locally: ${e.message}`,
          LONG_ALERT
        )
      )
    }

    // Funding is only possible on an active coin, which always has these tracked
    this.props.dispatch(expireData(chainTicker, API_GET_TRANSACTIONS))
    this.props.dispatch(expireData(chainTicker, API_GET_BALANCES))
    this.props.dispatch(expireData(chainTicker, API_GET_IDENTITIES))
  }

  advanceFormStep() {
    const { modalProps, setModalLock, closeModal } = this.props
    const { formStep, formData } = this.state
    let _txData

    setModalLock(true)
    this.setState({loading: true, loadingProgress: 99}, async () => {
      try {
        const { chainTicker } = modalProps

        if (modalProps.modalType === CREATE_GIFT_CARD) {
          _txData = await createSpendableKey(chainTicker, formData.password)
        } else if (modalProps.modalType === FUND_GIFT_CARD) {
          const { uri, address } = this.loadLatestFundableCard()

          _txData = await fundSpendableKey(
            formStep === ENTER_DATA,
            chainTicker,
            uri,
            formData.password,
            address,
            formData.funds || [],
            (formData.identities || []).map(identity => identity.identityAddress)
          )
        }

        setModalLock(false)
        if (_txData.msg === API_SUCCESS) {
          if (modalProps.modalType === CREATE_GIFT_CARD) {
            await this.saveNewGiftCard(_txData.result)
            this.props.dispatch(newSnackbar(SUCCESS_SNACK, `Gift card created!`, MID_LENGTH_ALERT))
            closeModal()
            return
          }

          if (formStep === CONFIRM_DATA) await this.saveFundingResult(_txData.result)

          this.setState({ loading: false, loadingProgress: 100, txData: {status: API_SUCCESS, result: _txData.result}, formStep: formStep + 1 })
        } else {
          throw new Error(_txData.result)
        }
      } catch (e) {
        setModalLock(false)
        if (formStep === ENTER_DATA) {
          this.props.dispatch(newSnackbar(ERROR_SNACK, e.message))
          this.setState({ loading: false })
        } else {
          this.setState({ loading: false, txData: {status: API_ERROR, error: e.message}, formStep: formStep + 1 })
        }
      }
    })
  }

  render() {
    return GiftCardRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const modalProps = state.modal[GIFT_CARD]

  return {
    modalProps,
    giftCard: modalProps.address != null ? (state.users.activeUser.giftCards || {})[modalProps.address] : null
  };
};

export default connect(mapStateToProps)(GiftCard);
