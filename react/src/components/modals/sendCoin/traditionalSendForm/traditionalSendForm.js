import React from 'react';
import { connect } from 'react-redux';
import { 
  TraditionalSendFormRender
} from './traditionalSendForm.render';
import { checkAddrValidity } from '../../../../util/addrUtils';
import {
  PRIVATE_BALANCE,
  PRIVATE_ADDRS,
  PUBLIC_ADDRS,
  TRANSPARENT_FUNDS,
  ERROR_INVALID_AMOUNT,
  ERROR_AMOUNT_MORE_THAN_BALANCE,
  ERROR_BALANCE_UNAVAILABLE,
  ERROR_INVALID_ADDR,
  ERROR_Z_AND_NO_FROM,
  SEND_COIN,
  WARNING_SNACK,
  NATIVE,
  TXDATA_TO,
  TXDATA_FROM,
  TXDATA_VALUE,
  TXDATA_FEE,
  TXDATA_TOTAL_AMOUNT,
  TXDATA_BALANCE,
  TXDATA_REMAINING_BALANCE,
  TXDATA_STATUS,
  TXDATA_ERROR,
  TXDATA_TXID,
  CONFIRM_DATA,
  Z_SEND,
  API_SUCCESS,
  ERROR_Z_NOT_SUPPORTED,
  TXDATA_INTEREST,
  SEND_TO_ADDRESS,
  ENTER_DATA,
  TXDATA_FROM_CURRENCY,
  TXDATA_TO_CURRENCY,
  TXDATA_MESSAGE,
  TXDATA_PRICE,
  TXDATA_CONVERSION_VALUE,
  LONG_ALERT
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';
import { checkFlag } from '../../../../util/flagUtils';
import { IS_GATEWAY_FLAG } from '../../../../util/constants/flags';
import { getSendBalance } from './balanceUtils';

class TraditionalSendForm extends React.Component {
  constructor(props) {
    super(props);

    this.TRANSPARENT_FUNDS_OBJ = {
      label: TRANSPARENT_FUNDS,
      address: null,
      balances: props.balances
    }

    this.state = {
      sendFrom: this.TRANSPARENT_FUNDS_OBJ,
      sendTo: "",
      amount: "",
      memo: "",
      addressList: [],
      addressMap: {},
      mint: false,
      isIdentity: false,
      displayCurrency: props.chainTicker,
      formErrors: {
        amount: [],
        sendFrom: [],
        sendTo: [],
      },
      txDataDisplay: {},
      // Force component re-render on autocomplete when it is loaded due to strange autocomplete bug
      fromDropdownKey: Math.random(),
      fromCurrencyInfo: {}
    }
    
    this.updateFormData = this.updateFormData.bind(this)
    this.updateSendFrom = this.updateSendFrom.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.updateFormErrors = this.updateFormErrors.bind(this)
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this)
    this.setSendAmountAll = this.setSendAmountAll.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.initState = this.initState.bind(this)
  }

  initState(cb = () => {}) {
    const isIdentity = this.props.identity != null
    
    const {
      balanceTag,
      chainTicker,
      activeCoin,
      currencyInfo,
    } = this.props;
    const currencyName = currencyInfo != null ? currencyInfo.currency.name : null
    const addresses = isIdentity ? this.props.identity.addresses : this.props.addresses[chainTicker]
    const { mode } = activeCoin

    const initAddressMap = () => {
      let addressMap = {}

      addresses[balanceTag === PRIVATE_BALANCE ? PRIVATE_ADDRS : PUBLIC_ADDRS].forEach(addressObj => {
        addressMap[addressObj.address] = {
          label: addressObj.address,
          address: addressObj.address,
          balances: addressObj.balances
        };
      })

      return addressMap
    }

    const addressMap = initAddressMap()
    const addressListFormatted =
      mode === NATIVE && !isIdentity && balanceTag !== PRIVATE_BALANCE
        ? [this.TRANSPARENT_FUNDS_OBJ, ...Object.values(addressMap)]
        : Object.values(addressMap);

    this.setState({
      sendFrom:
        mode === NATIVE && !isIdentity && balanceTag !== PRIVATE_BALANCE
          ? this.TRANSPARENT_FUNDS_OBJ
          : addressListFormatted[0],
      sendTo: "",
      amount: "",
      memo: "",
      addressList: addressListFormatted,
      addressMap,
      mint: false,
      isIdentity,
      displayCurrency:
        currencyName == null
          ? chainTicker
          : currencyName,
      formErrors: {
        amount: [],
        sendFrom: [],
        sendTo: [],
      },
      txDataDisplay: {},
      fromCurrencyInfo: currencyInfo
    }, cb);
  }

  componentDidMount() {
    this.initState()

    if (Object.keys(this.props.txData).length > 0) {
      this.generateTxDataDisplay()
    }
  }

  componentDidUpdate(lastProps, lastState) {
    const { formStep } = this.props
    
    if (lastProps.formStep !== formStep && formStep === ENTER_DATA) {
      this.updateFormErrors()
      this.updateFormData()
    }

    if (lastState.addressList.length !== this.state.addressList.length) {
      this.setState({ fromDropdownKey: Math.random() })
    }
  }

  updateSendFrom(value) {
    this.setAndUpdateState({ sendFrom: value })
  }

  getBalance(address, currency) {
    const { activeCoin, balances, chainTicker } = this.props
    const { addressMap } = this.state 

    return getSendBalance({
      address,
      addressMap,
      balances,
      chainTicker,
      currency,
      useAggregateForMissingAddress: activeCoin && activeCoin.mode !== NATIVE,
    });
  }

  generateWarningSnack(warnings) {    
    this.props.dispatch(newSnackbar(WARNING_SNACK, warnings[0].message, LONG_ALERT))
  }

  setSendAmountAll() {
    const balance = this.getBalance(
      this.state.sendFrom && this.state.sendFrom.address,
      this.state.displayCurrency
    );

    if (balance != null) this.setAndUpdateState({ amount: balance });
  }

  generateTxDataDisplay() {
    const { txData, formData, formStep } = this.props

    let txDataSchema = {
      ["Status:"]:
        formStep === CONFIRM_DATA
          ? null
          : txData.cliCmd === Z_SEND && txData[TXDATA_STATUS] === API_SUCCESS
          ? "pending"
          : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      [txData.cliCmd === Z_SEND ? "Operation ID:" : "Transaction ID:"]: txData[
        TXDATA_TXID
      ],
      ["To:"]: txData[TXDATA_TO],
      ["From:"]: txData[TXDATA_FROM],
      ["Sending Currency:"]:
        txData[TXDATA_FROM_CURRENCY] != null
          ? txData[TXDATA_FROM_CURRENCY].name
          : null,
      ["Receiving Currency:"]:
        txData[TXDATA_TO_CURRENCY] != null
          ? txData[TXDATA_TO_CURRENCY].name
          : null,
      ["Last Conversion Price:"]:
        txData[TXDATA_ERROR] ||
        txData[TXDATA_PRICE] == null ||
        txData[TXDATA_FROM_CURRENCY] == null ||
        txData[TXDATA_TO_CURRENCY] == null
          ? null
          : `${txData[TXDATA_PRICE]} ${txData[TXDATA_FROM_CURRENCY].name}/${txData[TXDATA_TO_CURRENCY].name}`,
      ["Last Price Based Conversion Value:"]:
        txData[TXDATA_ERROR] || txData[TXDATA_CONVERSION_VALUE] == null
          ? null
          : `${Number(txData[TXDATA_CONVERSION_VALUE].toFixed(8))} ${
              txData[TXDATA_TO_CURRENCY].name
            }`,
      ["Amount Entered"]:
        txData[TXDATA_ERROR] ||
        (!txData[TXDATA_ERROR] &&
          txData[TXDATA_VALUE] &&
          Number(txData[TXDATA_VALUE]) === Number(formData.amount))
          ? null
          : Number(formData.amount),
      ["Transaction Amount:"]:
        txData[TXDATA_ERROR] || !txData[TXDATA_VALUE]
          ? null
          : Number(txData[TXDATA_VALUE]),
      [formStep === CONFIRM_DATA ? "Estimated Fee:" : "Fee:"]:
        txData[TXDATA_FEE] == null ? null : Number(txData[TXDATA_FEE]),
      [txData.cliCmd === SEND_TO_ADDRESS
        ? formStep === CONFIRM_DATA
          ? "Interest to Claim:"
          : "Interest Claimed:"
        : "Max. Interest Loss"]: txData[TXDATA_INTEREST],
      ["Change in Balance:"]:
        txData[TXDATA_TOTAL_AMOUNT] != null
          ? `${Number(txData[TXDATA_TOTAL_AMOUNT]) < 0 ? "+" : "-"}${Number(
              txData[TXDATA_TOTAL_AMOUNT]
            )}`
          : null,
      ["Current Balance:"]:
        txData[TXDATA_BALANCE] == null ? null : Number(txData[TXDATA_BALANCE]),
      ["Est. Balance After Transaction:"]:
        txData[TXDATA_REMAINING_BALANCE] != null
          ? Number(txData[TXDATA_REMAINING_BALANCE])
          : null,
      ["Message:"]:
        txData[TXDATA_MESSAGE] == null || txData[TXDATA_MESSAGE].length === 0
          ? null
          : txData[TXDATA_MESSAGE],
    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey]
    })

    if (formStep === CONFIRM_DATA && txData.warnings && txData.warnings.length > 0) {
      this.generateWarningSnack(txData.warnings)
    }

    this.setState({ txDataDisplay: txDataSchema })
  }

  updateFormErrors() {
    const { chainTicker, activeCoin, setContinueDisabled } = this.props
    const { amount, sendFrom, sendTo, fromCurrencyInfo } = this.state
    const { mode } = activeCoin
    let formErrors = {
      amount: [],
      sendFrom: [],
      sendTo: []
    }

    if (amount == null || (amount.length !== 0 && (isNaN(amount) || Number(amount) < 0 || amount.length === 0))) {
      formErrors.amount.push(ERROR_INVALID_AMOUNT)
    } else if (
      amount.length !== 0 &&
      this.getBalance(sendFrom && sendFrom.address, this.state.displayCurrency) == null
    ) {
      formErrors.amount.push(ERROR_BALANCE_UNAVAILABLE)
    } else if (
      Number(this.getBalance(sendFrom && sendFrom.address, this.state.displayCurrency)) <
      Number(amount)
    ) {
      formErrors.amount.push(ERROR_AMOUNT_MORE_THAN_BALANCE)
    }

    // Do an address validity check only if fromCurrency isn't a PBaaS
    // gateway (PBaaS gateways can support multiple address types)
    // TODO: Check the address types supported by the pbaas gateway
    if (
      !(
        fromCurrencyInfo != null &&
        fromCurrencyInfo.currency != null &&
        ((fromCurrencyInfo.currency.nativecurrencyid != null &&
          fromCurrencyInfo.currency.nativecurrencyid.type === 9) ||
          fromCurrencyInfo.currency.currencyid === "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq")
      ) &&
      (sendTo == null || (sendTo.length !== 0 && !checkAddrValidity(sendTo, mode, chainTicker)))
    ) {
      formErrors.sendTo.push(ERROR_INVALID_ADDR);
    }
    
    if (sendTo[0] === 'z' && (sendTo.length === 95 || sendTo.length === 78)) {
      if (!sendFrom.address) formErrors.sendFrom.push(ERROR_Z_AND_NO_FROM)

      if (mode !== NATIVE) formErrors.sendFrom.push(ERROR_Z_NOT_SUPPORTED)
    }

    this.setState({ formErrors }, () => {
      setContinueDisabled(!Object.keys(this.state.formErrors).every((formInput) => {
        return (this.state.formErrors[formInput].length == 0)
      }) || amount.length === 0 || sendTo.length === 0)
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

  updateFormData() {
    const { chainTicker } = this.props
    const {
      sendTo,
      sendFrom,
      amount,
      memo,
      mint,
      fromCurrencyInfo,
      displayCurrency
    } = this.state;
    const currencyId =
      fromCurrencyInfo != null && fromCurrencyInfo.ownedIdentity != null
        ? `${fromCurrencyInfo.ownedIdentity.identity.name}@`
        : null;

    this.props.setFormData({
      chainTicker,
      toAddress: sendTo,
      amount,
      balance: sendFrom
        ? this.getBalance(sendFrom.address, displayCurrency)
        : 0,
      fromAddress: sendFrom ? sendFrom.address : null,
      memo,
      fromCurrencyInfo,
      mint,
      currencyId,
    });
  }

  render() {
    return TraditionalSendFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[SEND_COIN]

  return {
    addresses: state.ledger.addresses,
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker]
  };
};

export default connect(mapStateToProps)(TraditionalSendForm);
