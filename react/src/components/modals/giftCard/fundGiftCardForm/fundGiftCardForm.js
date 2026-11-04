import React from 'react';
import { connect } from 'react-redux';
import {
  FundGiftCardFormRender
} from './fundGiftCardForm.render';
import {
  GIFT_CARD,
  ENTER_DATA,
  CONFIRM_DATA,
  API_SUCCESS,
  TXDATA_STATUS,
  TXDATA_ERROR,
  ID_REVOKED,
  GIFT_CARD_FUNDING_FUNDS,
  GIFT_CARD_FUNDING_IDENTITY,
  SPENDABLE_KEY_CLAIM_NON_NATIVE_FEE_COINS,
  ERROR_INVALID_AMOUNT,
  ERROR_AMOUNT_MORE_THAN_BALANCE,
  ERROR_BALANCE_UNAVAILABLE,
  ERROR_GIFT_CARD_NO_SELECTION
} from "../../../../util/constants/componentConstants";
import { coinsToSats, satsToCoins } from '../../../../util/satMath';
import { copyDataToClipboard } from '../../../../util/copyToClipboard';

class FundGiftCardForm extends React.Component {
  constructor(props) {
    super(props);
    const { formData } = props

    this.state = {
      mode: formData.mode != null ? formData.mode : GIFT_CARD_FUNDING_FUNDS,
      fundAmounts: formData.fundAmounts != null ? formData.fundAmounts : {},
      selectedIds: formData.selectedIds != null ? formData.selectedIds : {},
      password: formData.password != null ? formData.password : '',
      formErrors: {
        fundAmounts: {},
        selection: []
      },
      txDataDisplay: {}
    }

    this.getFundingCurrencies = this.getFundingCurrencies.bind(this)
    this.getFundingIdentities = this.getFundingIdentities.bind(this)
    this.getSelectedFunds = this.getSelectedFunds.bind(this)
    this.getSelectedIdentities = this.getSelectedIdentities.bind(this)
    this.getMaxFundAmount = this.getMaxFundAmount.bind(this)
    this.updateFormData = this.updateFormData.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.updateFormErrors = this.updateFormErrors.bind(this)
    this.setMode = this.setMode.bind(this)
    this.updateFundAmount = this.updateFundAmount.bind(this)
    this.setFundAmountMax = this.setFundAmountMax.bind(this)
    this.toggleIdentity = this.toggleIdentity.bind(this)
    this.copyAddressAndExit = this.copyAddressAndExit.bind(this)
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this)
  }

  componentDidMount() {
    if (this.props.formStep === ENTER_DATA) {
      this.updateFormErrors()
      this.updateFormData()
    } else this.generateTxDataDisplay()
  }

  // The wallet's public balances, native currency first
  getFundingCurrencies() {
    const { balances, chainTicker } = this.props
    const currencies = [
      {
        currency: chainTicker,
        balance:
          balances != null && balances.native != null && balances.native.public != null
            ? balances.native.public.confirmed
            : null
      }
    ]

    if (balances != null && balances.reserve != null) {
      Object.keys(balances.reserve).forEach(currency => {
        const reserveBalance = balances.reserve[currency]
        const balance = reserveBalance.public != null ? reserveBalance.public.confirmed : null

        if (currency !== chainTicker && balance != null && Number(balance) > 0) {
          currencies.push({ currency, balance })
        }
      })
    }

    return currencies
  }

  // VerusIDs this wallet can move to the gift card
  getFundingIdentities() {
    return (this.props.identities || [])
      .filter(idObj => idObj.canspendfor && idObj.status !== ID_REVOKED)
      .map(idObj => ({
        identityAddress: idObj.identity.identityaddress,
        fullyQualifiedName: `${idObj.identity.name}@`
      }))
  }

  getSelectedFunds() {
    const { mode, fundAmounts } = this.state

    if (mode === GIFT_CARD_FUNDING_IDENTITY) return []

    return this.getFundingCurrencies()
      .filter(({ currency }) => {
        const amount = fundAmounts[currency]

        return amount != null && amount.length > 0 && !isNaN(amount) && Number(amount) > 0
      })
      .map(({ currency }) => ({ currency, amount: Number(fundAmounts[currency]) }))
  }

  getSelectedIdentities() {
    const { mode, selectedIds } = this.state

    if (mode === GIFT_CARD_FUNDING_FUNDS) return []

    return this.getFundingIdentities().filter(identity => selectedIds[identity.identityAddress] === true)
  }

  // Leaves room for the funding fee when sending the native currency
  getMaxFundAmount(currency, balance) {
    if (balance == null) return null

    const maxAmount =
      currency === this.props.chainTicker
        ? satsToCoins(coinsToSats(balance) - coinsToSats(SPENDABLE_KEY_CLAIM_NON_NATIVE_FEE_COINS))
        : Number(balance)

    return maxAmount > 0 ? maxAmount : 0
  }

  updateFormErrors() {
    const { setContinueDisabled, giftCard } = this.props
    const { mode, fundAmounts, password } = this.state
    let formErrors = {
      fundAmounts: {},
      selection: []
    }

    if (mode !== GIFT_CARD_FUNDING_IDENTITY) {
      this.getFundingCurrencies().forEach(({ currency, balance }) => {
        const amount = fundAmounts[currency]

        if (amount == null || amount.length === 0) return

        if (isNaN(amount) || Number(amount) <= 0) {
          formErrors.fundAmounts[currency] = ERROR_INVALID_AMOUNT
        } else if (balance == null) {
          formErrors.fundAmounts[currency] = ERROR_BALANCE_UNAVAILABLE
        } else if (Number(amount) > Number(balance)) {
          formErrors.fundAmounts[currency] = ERROR_AMOUNT_MORE_THAN_BALANCE
        }
      })
    }

    if (
      (mode !== GIFT_CARD_FUNDING_IDENTITY && this.getSelectedFunds().length === 0) ||
      (mode !== GIFT_CARD_FUNDING_FUNDS && this.getSelectedIdentities().length === 0)
    ) {
      formErrors.selection.push(ERROR_GIFT_CARD_NO_SELECTION)
    }

    this.setState({ formErrors }, () => {
      setContinueDisabled(
        Object.keys(formErrors.fundAmounts).length > 0 ||
          formErrors.selection.length > 0 ||
          (giftCard != null && giftCard.encrypted && password.length === 0)
      );
    })
  }

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormErrors()
      this.updateFormData()
    })
  }

  updateInput(e) {
    this.setAndUpdateState({ [e.target.name]: e.target.value })
  }

  setMode(e) {
    this.setAndUpdateState({ mode: e.target.value })
  }

  updateFundAmount(currency, amount) {
    this.setAndUpdateState({ fundAmounts: { ...this.state.fundAmounts, [currency]: amount } })
  }

  setFundAmountMax(currency, balance) {
    const maxAmount = this.getMaxFundAmount(currency, balance)

    if (maxAmount != null) this.updateFundAmount(currency, maxAmount.toString())
  }

  toggleIdentity(identityAddress) {
    this.setAndUpdateState({
      selectedIds: {
        ...this.state.selectedIds,
        [identityAddress]: this.state.selectedIds[identityAddress] !== true
      }
    })
  }

  copyAddressAndExit() {
    copyDataToClipboard(this.props.giftCard.address, "Gift card address copied to clipboard.")
    this.props.closeModal()
  }

  generateTxDataDisplay() {
    const { txData, formData, formStep } = this.props
    const result = txData.result || {}
    const transactions = (formStep === CONFIRM_DATA ? result.transactions : result.results) || []
    const isPartial = formStep !== CONFIRM_DATA && txData[TXDATA_STATUS] === API_SUCCESS && result.partialError != null
    const formatAmounts = amounts => amounts.map(({ currency, amount }) => `${amount} ${currency}`).join(", ")

    let txDataSchema = {
      ["Status:"]:
        formStep === CONFIRM_DATA
          ? null
          : isPartial
          ? "Funding partially completed"
          : txData[TXDATA_STATUS],
      ["Error:"]: isPartial
        ? `${transactions.length} funding transaction${transactions.length === 1 ? "" : "s"} ${
            transactions.length === 1 ? "was" : "were"
          } submitted before an error occurred: ${result.partialError}`
        : txData[TXDATA_ERROR],
      ["Funds sent from wallet:"]:
        (formData.funds || []).length > 0 ? formatAmounts(formData.funds) : null,
      ["VerusIDs moved to gift card:"]:
        (formData.identities || []).length > 0
          ? formData.identities.map(identity => identity.fullyQualifiedName).join(", ")
          : null,
      ["Native fee funds added:"]:
        formStep === CONFIRM_DATA && (result.topups || []).length > 0
          ? formatAmounts(result.topups)
          : null,
      ["Transactions:"]:
        formStep === CONFIRM_DATA && transactions.length > 0
          ? transactions
              .map(transaction => (transaction.type === 'identity' ? "VerusID update" : "Currency transfer"))
              .join(", ")
          : null,
      ["Transaction IDs:"]:
        formStep !== CONFIRM_DATA && transactions.length > 0
          ? transactions.map(transaction => transaction.txid).join(", ")
          : null
    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey]
    })

    this.setState({ txDataDisplay: txDataSchema })
  }

  updateFormData() {
    const { mode, fundAmounts, selectedIds, password } = this.state
    const { giftCard } = this.props

    this.props.setFormData({
      ...this.props.formData,
      mode,
      fundAmounts,
      selectedIds,
      funds: this.getSelectedFunds(),
      identities: this.getSelectedIdentities(),
      password: giftCard != null && giftCard.encrypted ? password : undefined
    });
  }

  render() {
    return FundGiftCardFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker, address } = state.modal[GIFT_CARD]

  return {
    balances: state.ledger.balances[chainTicker],
    identities: state.ledger.identities[chainTicker],
    giftCard: (state.users.activeUser.giftCards || {})[address]
  };
};

export default connect(mapStateToProps)(FundGiftCardForm);
