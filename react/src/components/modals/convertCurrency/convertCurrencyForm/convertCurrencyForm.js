import React from 'react';
import { connect } from 'react-redux';
import { 
  ConvertCurrencyFormRender
} from './convertCurrencyForm.render';
import {
  ADVANCED_CONVERSION,
  API_GET_RESERVE_TRANSFERS,
  API_SUCCESS,
  CONVERT_CURRENCY,
  ENTER_DATA,
  ERROR_SNACK,
  INFO_SNACK,
  MID_LENGTH_ALERT,
  NATIVE,
  SEND_RESULT,
  SIMPLE_CONVERSION,
  WHITELISTS,
} from "../../../../util/constants/componentConstants";
import { getCurrencyConversionPaths, getIdentity, sendCurrency } from '../../../../util/api/wallet/walletCalls';
import { expireData, newSnackbar } from '../../../../actions/actionCreators';

class ConvertCurrencyForm extends React.Component {
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
        receiveAmount: ""
      }],
      estArrivals: [],
      conversionPaths: {},
      nameMap: {},
      selectedConversionPath: null,
      addresses: [],
      formStep: ENTER_DATA,
      confirmOutputIndex: 0,
      controlAmounts: true
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

    this.outputsEnd = null;
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
        receiveAmount: "",
        exportto: ""
      }],
      estArrivals: [],
      conversionPaths: {},
      nameMap: {},
      selectedConversionPath: null,
      addresses: [],
      formStep: ENTER_DATA,
      confirmOutputIndex: 0,
      controlAmounts: true
    }, () => {
      this.processAddresses()
    })
  }

  componentDidUpdate(lastProps, lastState) {
    if (lastProps.mode !== this.props.mode) this.resetState()

    if (
      this.props.mode === SIMPLE_CONVERSION &&
      (lastProps.info != this.props.info ||
        lastState.outputs.length != this.state.outputs.length ||
        !lastState.outputs.every(
          (output, index) =>
            output.address === this.state.outputs[index].address
        ))
    ) {
      let arrivals = [];

      let outputs = this.state.outputs.map((x) => {
        const isPreconvert =
          x.convertto != null &&
          this.state.conversionPaths[x.convertto] &&
          this.props.info.longestchain &&
          this.state.conversionPaths[x.convertto].destination.startblock >
            this.props.info.longestchain;

        arrivals.push(
          isPreconvert
            ? this.state.conversionPaths[x.convertto].destination.startblock -
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
          exportto: x.exportto
        };
      });

      this.setState({
        outputs,
        estArrivals: arrivals,
      });
    }

    if (this.props.mode === ADVANCED_CONVERSION && lastState.outputs.length < this.state.outputs.length) {
      setTimeout(() => {
        this.scrollToOutputBottom()
      }, 0);
    }
  }

  async confirmSend() {
    try {
      const response = await sendCurrency(
        this.props.modalProps.chainTicker,
        this.state.fromAddress,
        this.state.outputs.map((output) => {
          const {
            currency,
            amount,
            convertto,
            via,
            address,
            refundto,
            memo,
            preconvert,
            exportto
          } = output;

          return {
            currency,
            amount,
            convertto,
            via,
            address,
            refundto,
            memo,
            preconvert,
            exportto
          };
        })
      );

      if (response.msg === 'success') {
        this.props.dispatch(expireData(this.props.modalProps.chainTicker, API_GET_RESERVE_TRANSFERS))
        this.setState({
          formStep: SEND_RESULT
        })
      } else this.props.dispatch(newSnackbar(ERROR_SNACK, "Error: " + response.result))
      
    } catch(e) {
      this.props.dispatch(newSnackbar(ERROR_SNACK, "Error: " + e.message))
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

  updateSimpleFormAmount(e, isSend) {
    const validInput = this.isValidAmount(e.target.value)

    if (isSend) {
      this.updateOutput(
        "sendAmount",
        e.target.value || ""
      )

      if (validInput) {
        this.setControlAmounts(true)
        this.updateOutput(
          "amount",
          Number(e.target.value)
        )
      } else {
        this.setControlAmounts(false)
      }
    } else {
      this.updateOutput(
        "receiveAmount",
        e.target.value || ""
      )

      if (validInput) {
        const price = this.state.conversionPaths[this.state.selectedConversionPath]
        ? this.state.conversionPaths[this.state.selectedConversionPath].price
        : 0;

        this.setControlAmounts(true);
        this.updateOutput(
          "amount",
          Number(price === 0 ? 0 : (Number(e.target.value) / price).toFixed(8))
        );
      } else {
        this.setControlAmounts(false);
      }
    }
  }

  isValidAmount(input) {
    return (
      !isNaN(input) &&
      typeof input === "string" &&
      !(
        input[input.length - 1] === "." ||
        (input.includes(".") && input[input.length - 1] === "0")
      )
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
        receiveAmount: "",
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
    this.setState({
      formStep: step
    })
  }

  selectConversionPath(path) {
    const selectedPathObj = this.state.conversionPaths[path]

    this.setState({
      selectedConversionPath: selectedPathObj.destination.currencyid
    }, () => {
      this.updateOutput("convertto", selectedPathObj.destination.currencyid)
      if (selectedPathObj.via) this.updateOutput("via", selectedPathObj.via.currencyid)
      else this.updateOutput("via", null)

      if (selectedPathObj.exportto) this.updateOutput("exportto", selectedPathObj.exportto)
      else this.updateOutput("exportto", null)
    })
  }

  async processAddresses() {
    let addrList = []

    if (this.props.addresses) {
      for (const x of Object.values(this.props.addresses)) {
        for (const value of x) {
          if (value.tag === 'identity' && !value.address.includes("@")) {
            try {
              const id = await getIdentity(
                NATIVE,
                this.props.modalProps.chainTicker,
                value.address
              );
  
              if (id.msg !== "success")
                throw new Error("Error processing id for " + value.address);
  
              addrList.push(id.result.identity.name + "@");
            } catch (e) {
              console.error(e)
              addrList.push(value.address);
            }
          } else addrList.push(value.address);
        }
      }
    }

    this.setState({
      addresses: addrList
    })
  }

  selectSimpleSourceCurrency(source) {
    this.setState({
      conversionPaths: {},
      selectedConversionPath: null
    }, async () => {
      const adjustedSource =
        source.toUpperCase() === this.props.modalProps.chainTicker
          ? source
          : `${source}.${this.props.modalProps.chainTicker}`;
      this.updateOutput("convertto", "")
      this.updateOutput("exportto", "")
      this.updateOutput("currency", adjustedSource)
      await this.fetchConversionPaths(adjustedSource)
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
          Object.values(response.result).map(x => {
            nameMap[x.destination.name] = x.destination.currencyid
          })
  
          this.setState({ conversionPaths: response.result, nameMap })
        }
      } else {
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
    whitelist:
      state.localCurrencyLists[WHITELISTS][
        state.modal[CONVERT_CURRENCY].chainTicker
      ] || [],
  };
};

export default connect(mapStateToProps)(ConvertCurrencyForm);