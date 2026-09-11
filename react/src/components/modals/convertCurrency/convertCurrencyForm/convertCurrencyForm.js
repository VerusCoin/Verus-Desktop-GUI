import React from 'react';
import { connect } from 'react-redux';
import { 
  ConvertCurrencyFormRender
} from './convertCurrencyForm.render';
import {
  ADVANCED_CONVERSION,
  API_GET_RESERVE_TRANSFERS,
  API_SUCCESS,
  CONFIRM_DATA,
  CONVERT_CURRENCY,
  ENTER_DATA,
  ERROR_SNACK,
  INFO_SNACK,
  MID_LENGTH_ALERT,
  NATIVE,
  PUBLIC_ADDRS,
  SEND_RESULT,
  SIMPLE_CONVERSION,
  WHITELISTS,
} from "../../../../util/constants/componentConstants";
import { estimateConversion, getCurrencyConversionPaths, getRefundAddress, sendCurrency, estimateSendcurrencyFee } from '../../../../util/api/wallet/walletCalls';
import { expireData, newSnackbar, updateLocalWhitelists } from '../../../../actions/actionCreators';

export class ConvertCurrencyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromAddress: '*',
      outputs: [{
        currency: "",
        amount: 0,
        convertto: "",
        via: "",
        address: "",
        refundto: "",
        memo: "",
        preconvert: "",
        sendAmount: "",
      }],
      estArrivals: [],
      conversionPaths: [],
      nameMap: {},
      selectedConversionPath: null,
      addresses: [],
      formStep: ENTER_DATA,
      confirmOutputIndex: 0,
      controlAmounts: true,
      loading: false,

      fetchingEstimate: false,
      fetchingFee: false,
      conversionEstimate: null,
      feeEstimate: null,
      lastSimpleAmountChange: 0
    };

    this.updateOutput = this.updateOutput.bind(this)
    this.selectSimpleSourceCurrency = this.selectSimpleSourceCurrency.bind(this)
    this.selectConversionPath = this.selectConversionPath.bind(this)
    this.processAddresses = this.processAddresses.bind(this)
    this.setFormStep = this.setFormStep.bind(this)
    this.resetState = this.resetState.bind(this)
    this.confirmSend = this.confirmSend.bind(this)
    this.addOutput = this.addOutput.bind(this)
    this.removeOutput = this.removeOutput.bind(this)
    this.scrollToOutputBottom = this.scrollToOutputBottom.bind(this)
    this.setControlAmounts = this.setControlAmounts.bind(this)
    this.updateSimpleFormAmount = this.updateSimpleFormAmount.bind(this)
    this.updateAdvancedFormAmount = this.updateAdvancedFormAmount.bind(this)
    this.isValidAmount = this.isValidAmount.bind(this)
    this.addToWhitelist = this.addToWhitelist.bind(this)

    this.outputsEnd = null;

    this.AMOUNT_CHANGE_FETCH_ESTIMATE_COOLDOWN = 400
  }

  async componentDidMount() {
    if (this.props.initCurrency != null && this.props.mode === SIMPLE_CONVERSION) {
      this.selectSimpleSourceCurrency(this.props.initCurrency)
    }

    await this.processAddresses()
  }

  scrollToOutputBottom() {
    this.outputsEnd.scrollIntoView({ behavior: "smooth" });
  }

  resetState() {
    this.setState({
      fromAddress: '*',
      outputs: [{
        currency: "",
        amount: 0,
        convertto: "",
        via: "",
        address: "",
        refundto: "",
        memo: "",
        preconvert: "",
        sendAmount: "",
        exportto: ""
      }],
      estArrivals: [],
      conversionPaths: [],
      nameMap: {},
      selectedConversionPath: null,
      addresses: [],
      formStep: ENTER_DATA,
      confirmOutputIndex: 0,
      controlAmounts: true,

      fetchingEstimate: false,
      fetchingFee: false,
      conversionEstimate: null,
      feeEstimate: null,
      lastSimpleAmountChange: 0
    }, () => {
      this.processAddresses()
    })
  }

  componentDidUpdate(lastProps, lastState) {
    if (lastProps.mode !== this.props.mode) this.resetState()

    if (lastProps.addresses !== this.props.addresses) this.processAddresses();

    const { conversionPaths, outputs, selectedConversionPath } = this.state

    if (
      this.props.mode === SIMPLE_CONVERSION &&
      (lastProps.info != this.props.info ||
        lastState.outputs.length != outputs.length ||
        !lastState.outputs.every(
          (output, index) =>
            output.address === outputs[index].address
        ))
    ) {
      let arrivals = [];

      const newOutputs = outputs.map((x) => {
        const isPreconvert =
          x.convertto != null &&
          selectedConversionPath != null &&
          conversionPaths[selectedConversionPath] &&
          this.props.info.longestchain &&
          (conversionPaths[selectedConversionPath].destination.launchsystemid !==
          conversionPaths[selectedConversionPath].destination.spotterid
            ? 1
            : conversionPaths[selectedConversionPath].destination.startblock) >
            this.props.info.longestchain;

        arrivals.push(
          isPreconvert
            ? (conversionPaths[selectedConversionPath].destination.launchsystemid !==
              conversionPaths[selectedConversionPath].destination.spotterid
                ? 1
                : conversionPaths[selectedConversionPath].destination.startblock) -
                this.props.info.longestchain
            : null
        );
        return {
          currency: x.currency,
          amount: x.amount,
          convertto: x.convertto,
          via: x.via,
          address: x.address,
          refundto: isPreconvert ? x.address : null,
          memo: x.memo,
          preconvert: isPreconvert,
          exportto: x.exportto,
        };
      });

      this.setState({
        outputs: newOutputs,
        estArrivals: arrivals,
      });
    }

    if (this.props.mode === ADVANCED_CONVERSION && lastState.outputs.length < this.state.outputs.length) {
      setTimeout(() => {
        this.scrollToOutputBottom()
      }, 0);
    }
  }

  async addToWhitelist(name) {
    const {
      whitelists,
      activeCoin,
      dispatch,
    } = this.props;

    const currentWhitelist = whitelists[activeCoin.id] || []

    try {
      dispatch(
        await updateLocalWhitelists({
          ...whitelists,
          [activeCoin.id]: [...currentWhitelist, name],
        })
      );
    } catch(e) {
      dispatch(newSnackbar(ERROR_SNACK, e.message));
    }
  }

  async confirmSend() {
    if (this.state.loading || !this.hasValidAmounts()) return;

    const setLoadingTrue = () => new Promise((resolve) => {
      this.setState({ loading: true }, () => {
        resolve();
      })
    })

    try {
      await setLoadingTrue()

      const response = await sendCurrency(
        this.props.modalProps.chainTicker,
        this.state.fromAddress,
        await Promise.all(
          this.state.outputs.map(async (output) => {
            const {
              currency,
              amount,
              convertto,
              via,
              address,
              refundto,
              memo,
              preconvert,
              exportto,
            } = output;
            let finalRefundTo = refundto;

            // Refundto is required for txs to different systems
            if (
              address.startsWith("0x") &&
              !address.includes("@") &&
              (finalRefundTo == null || finalRefundTo.length == 0)
            ) {
              const refundAddrResponse = await getRefundAddress(
                NATIVE,
                this.props.modalProps.chainTicker
              );

              if (refundAddrResponse.msg === "success") {
                finalRefundTo = refundAddrResponse.result;
              }
            }

            return {
              currency,
              amount,
              convertto,
              via,
              address,
              refundto: finalRefundTo,
              memo,
              preconvert,
              exportto,
            };
          })
        )
      );

      if (response.msg === 'success') {
        this.props.dispatch(expireData(this.props.modalProps.chainTicker, API_GET_RESERVE_TRANSFERS))
        this.setState({
          formStep: SEND_RESULT
        })
      } else this.props.dispatch(newSnackbar(ERROR_SNACK, "Error: " + response.result))
      
    } catch(e) {
      this.props.dispatch(newSnackbar(ERROR_SNACK, "Error: " + e.message))
    } finally {
      this.setState({
        loading: false
      })
    }
  }

  updateOutput(key, value, index = 0) {
    let outputs = this.state.outputs
    outputs[index][key] = value

    this.setState({
      outputs
    })
  }

  setControlAmounts(x) {
    this.setState({
      controlAmounts: x == true
    })
  }

  async updateConversionEstimate() {
    if ((Date.now() - this.state.lastSimpleAmountChange) > this.AMOUNT_CHANGE_FETCH_ESTIMATE_COOLDOWN) {
      const { outputs } = this.state

      try {
        if (outputs[0] != null) {
          const pricingOutput = outputs[0];
          const { currency, amount, convertto, via, preconvert } = pricingOutput;
  
          if (
            currency != null && 
            amount != null && 
            convertto != null && 
            currency.length != 0 && 
            amount != 0 && 
            convertto.length != 0
          ) {
            const estimate = await estimateConversion(
              NATIVE, 
              this.props.modalProps.chainTicker, 
              { currency, amount, convertto, preconvert, via}
            )
  
            if (estimate.msg === 'success') {
              this.setState({
                fetchingEstimate: false,
                conversionEstimate: estimate.result
              })
            } else {
              this.setState({
                fetchingEstimate: false,
                conversionEstimate: null
              })
            }
          } else {
            this.setState({
              fetchingEstimate: false,
              conversionEstimate: null
            })
          }
        }
      } catch(e) {
        this.setState({
          fetchingEstimate: false,
          conversionEstimate: null
        })
      }
    }
  }

  async updateFeeEstimate() {
    if ((Date.now() - this.state.lastSimpleAmountChange) > this.AMOUNT_CHANGE_FETCH_ESTIMATE_COOLDOWN) {
      const { outputs } = this.state

      try {
        if (outputs[0] != null) {
          const pricingOutput = outputs[0];
          const { currency, amount, convertto, via, preconvert, exportto } = pricingOutput;
  
          if (
            currency != null && 
            amount != null && 
            convertto != null && 
            currency.length != 0 && 
            amount != 0 && 
            convertto.length != 0
          ) {
            const estimate = await estimateSendcurrencyFee(
              NATIVE, 
              this.props.modalProps.chainTicker,
              { currency, amount, convertto, preconvert, via, exportto },
              1,
              0.0001
            );
  
            if (estimate.msg === 'success') {
              this.setState({
                fetchingFee: false,
                feeEstimate: estimate.result
              })
            } else {
              this.setState({
                fetchingFee: false,
                feeEstimate: null
              })
            }
          } else {
            this.setState({
              fetchingFee: false,
              feeEstimate: null
            })
          }
        }
      } catch(e) {
        this.setState({
          fetchingFee: false,
          feeEstimate: null
        })
      }
    }
  }

  updateSimpleFormAmount(e) {
    const amount = e.target.value;

    setTimeout(() => {
      this.updateConversionEstimate()
      this.updateFeeEstimate()
    }, this.AMOUNT_CHANGE_FETCH_ESTIMATE_COOLDOWN + 100)

    this.setState({
      lastSimpleAmountChange: Date.now(),
      conversionEstimate: null,
      feeEstimate: null,
      fetchingEstimate: true,
      fetchingFee: true
    }, () => {
      const validInput = this.isValidAmount(amount)

      this.updateOutput(
        "sendAmount",
        amount
      )
  
      if (validInput) {
        this.updateOutput(
          "amount",
          Number(amount)
        )
      } else {
        this.updateOutput(
          "amount",
          0
        )
      }
    })
  }

  isValidAmount(input) {
    return (
      typeof input === "string" &&
      input.trim().length > 0 &&
      Number.isFinite(Number(input)) &&
      Number(input) > 0
    );
  }

  hasValidAmounts() {
    return this.state.outputs.length > 0 && this.state.outputs.every(
      (output) => Number.isFinite(output.amount) && output.amount > 0
    );
  }

  updateAdvancedFormAmount(e, index) {
    const validInput = this.isValidAmount(e.target.value)

    this.updateOutput(
      "sendAmount",
      e.target.value || "",
      index
    )

    if (validInput) {
      this.setControlAmounts(true)
      this.updateOutput(
        "amount",
        Number(e.target.value),
        index
      )
    } else {
      this.setControlAmounts(false)
      this.updateOutput("amount", 0, index)
    }
  }

  addOutput() {
    this.setState({
      outputs: [...this.state.outputs, {
        currency: "",
        amount: 0,
        convertto: "",
        via: "",
        address: "",
        refundto: "",
        memo: "",
        preconvert: "",
        sendAmount: "",
        exportto: ""
      }]
    })
  }

  removeOutput(atIndex) {
    this.setState({
      outputs: this.state.outputs.filter((value, index) => index !== atIndex)
    })
  }

  setFormStep(step) {
    if (step === CONFIRM_DATA && !this.hasValidAmounts()) return;

    this.setState({
      formStep: step
    })
  }

  selectConversionPath(path) {
    this.setState({
      selectedConversionPath: path,
      conversionEstimate: null,
      feeEstimate: null,
      fetchingEstimate: true,
      fetchingFee: true
    }, () => {
      if (path != null) {    
        const selectedPathObj = this.state.conversionPaths[path]

        this.updateOutput("convertto", selectedPathObj.destination.currencyid)
        if (selectedPathObj.via) this.updateOutput("via", selectedPathObj.via.currencyid)
        else this.updateOutput("via", null)

        if (selectedPathObj.exportto) this.updateOutput("exportto", selectedPathObj.exportto.currencyid)
        else this.updateOutput("exportto", null)

        this.updateConversionEstimate()
        this.updateFeeEstimate()
      }
    })
  }

  async processAddresses() {
    this.setState({
      addresses: this.props.addresses
        ? this.props.addresses.public.map((value) => value.address)
        : []
    })
  }

  selectSimpleSourceCurrency(source) {
    this.setState({
      conversionPaths: [],
      selectedConversionPath: null
    }, async () => {
      this.updateOutput("convertto", "")
      this.updateOutput("exportto", "")
      this.updateOutput("currency", source)
      await this.fetchConversionPaths(source)
      this.props.clearInitCurrency()
    })
  }

  async fetchConversionPaths(from) {
    this.props.setLoading(true, "Searching for currency conversions...")

    try {
      const response = await getCurrencyConversionPaths(NATIVE, this.props.modalProps.chainTicker, from)

      if (response.msg === API_SUCCESS) {
        if (Object.keys(response.result).length === 0) {
          this.props.dispatch(newSnackbar(INFO_SNACK, `No possible conversions found from "${from}".`, MID_LENGTH_ALERT))
        } else {
          let nameMap = {}
          Object.values(response.result).map((x) => {
            for (const conversionPath of x) {
              nameMap[conversionPath.destination.name] = conversionPath.destination.currencyid;
            }
          });
  
          this.setState({ conversionPaths: (Object.values(response.result)).flat(), nameMap })
        }
      } else {
        console.warn(response)
        this.props.dispatch(newSnackbar(ERROR_SNACK, `Error fetching potential conversions for ${from}!`, MID_LENGTH_ALERT))
      }
  
      this.props.setLoading(false)
    } catch(e) {
      console.warn(e)
      this.props.dispatch(newSnackbar(ERROR_SNACK, `Internal error while fetching potential conversions for ${from}!`, MID_LENGTH_ALERT))
      this.props.setLoading(false)
    }
  }

  render() {    
    return ConvertCurrencyFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    modalProps: state.modal[CONVERT_CURRENCY],
    addresses:
      state.ledger.addresses[state.modal[CONVERT_CURRENCY].chainTicker],
    info: state.ledger.info[state.modal[CONVERT_CURRENCY].chainTicker],
    balances: state.ledger.balances[state.modal[CONVERT_CURRENCY].chainTicker],
    activeCoin: state.coins.activatedCoins[state.modal[CONVERT_CURRENCY].chainTicker],
    whitelists: state.localCurrencyLists[WHITELISTS]
  };
};

export default connect(mapStateToProps)(ConvertCurrencyForm);
