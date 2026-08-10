import React from 'react';
import { connect } from 'react-redux';
import {
  BridgekeeperRender
} from './bridgekeeper.render';
import { appendBridgekeeperLogEntry } from './bridgekeeper.log';
import {
  API_ERROR,
  API_SUCCESS,
  ENTER_DATA,
  STARTBRIDGEKEEPER
} from "../../../util/constants/componentConstants";
import { updateConfFile, bridgekeeperStatus, getConfFile } from '../../../util/api/verusbridge/verusbridge';
const shell =
  typeof window !== "undefined" && window.bridge
    ? window.bridge.shell
    : null
const SERVER_OK = 1;

const responseErrorMessage = (value, fallback) => {
  if (typeof value === "string" && value.length > 0) return value
  if (value && typeof value.message === "string" && value.message.length > 0) {
    return value.message
  }
  return fallback
}

export const requireSuccessfulBridgekeeperResponse = (response, operation) => {
  if (response == null || response.msg === API_ERROR) {
    throw new Error(
      responseErrorMessage(
        response && response.result,
        `${operation} failed.`
      )
    )
  }
  if (response.msg !== API_SUCCESS) {
    throw new Error(`${operation} returned an invalid response.`)
  }
  return response.result
}

export class Bridgekeeper extends React.Component {
  constructor(props) {
    super(props);

    props.setModalHeader("Bridgekeeper setup")
    this.state = {
      formStep: ENTER_DATA,
      txData: {},
      loading: false,
      loadingProgress: 0,
      formData: {},
      continueDisabled: true,
      logData: null,
      infuraNode: '',
      bridgeKeeperActive: false,
      bridgeKeeperStatusAvailable: false,
      lastError: null
    }
    this.bridgekeeperRequestInProgress = false

    this.getFormData = this.getFormData.bind(this)
    this.back = this.back.bind(this)
    this.getContinueDisabled = this.getContinueDisabled.bind(this)
    this.setConfFile = this.setConfFile.bind(this)
    this.getBridgekeeperInfo = this.getBridgekeeperInfo.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.openInfura = this.openInfura.bind(this)
  }

  async componentDidMount() {
    const activeCoin = this.props.activeCoin
    if (!activeCoin || typeof activeCoin.id !== "string") {
      const message = "Unable to load Bridgekeeper: the active coin is unavailable."
      this.updateLog(message)
      this.setState({ lastError: message })
      return false
    }

    const { id } = activeCoin
    let configurationLoaded = false
    let statusLoaded = false
    this.bridgekeeperRequestInProgress = true
    this.setState({ loading: true, lastError: null })

    try {
      const result = requireSuccessfulBridgekeeperResponse(
        await getConfFile(id),
        "Loading Bridgekeeper configuration"
      )
      if (result && typeof result.ethnode === "string") {
        this.setState({ infuraNode: result.ethnode })
      }
      configurationLoaded = true
    } catch (e) {
      const message = `Unable to load Bridgekeeper configuration: ${e.message}`
      this.updateLog(message)
      this.setState({ lastError: message })
    }

    try {
      const result = requireSuccessfulBridgekeeperResponse(
        await bridgekeeperStatus(id),
        "Loading Bridgekeeper status"
      )
      const statusAvailable =
        result != null && Number.isInteger(result.serverrunning)

      if (!statusAvailable) {
        throw new Error("Bridgekeeper status is not available yet.")
      }

      this.setState({
        bridgeKeeperActive: result.serverrunning === SERVER_OK,
        bridgeKeeperStatusAvailable: true
      })
      statusLoaded = true
    } catch (e) {
      const message = `Unable to load Bridgekeeper status: ${e.message}`
      this.updateLog(message)
      this.setState({
        bridgeKeeperActive: false,
        bridgeKeeperStatusAvailable: false,
        lastError: message
      })
    } finally {
      this.bridgekeeperRequestInProgress = false
      this.setState({ loading: false })
    }

    return configurationLoaded && statusLoaded
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
      txData: {},
      formData: {}
    })
  }

  openInfura() {
    if (shell && typeof shell.openExternal === "function") {
      shell.openExternal("https://www.infura.io/")
    }
  }

  updateLog(text) {
    this.setState((state) => ({
      logData: appendBridgekeeperLogEntry(state.logData, text)
    }));
  }

  updateInput(e, value = false) {
    this.setState({
      [e.target.name]:
        value === false ? e.target.value : value == null ? "" : value,
    })
  }

  async setConfFile() {
    if (this.state.loading || this.bridgekeeperRequestInProgress) return false

    const activeCoin = this.props.activeCoin
    if (!activeCoin || typeof activeCoin.id !== "string") {
      const message = "Unable to update Bridgekeeper configuration: the active coin is unavailable."
      this.updateLog(message)
      this.setState({ lastError: message })
      return false
    }

    const { id } = activeCoin
    this.updateLog("Updating vETH .conf file");
    this.bridgekeeperRequestInProgress = true
    if (typeof this.props.setModalLock === "function") {
      this.props.setModalLock(true)
    }
    this.setState({ loading: true, lastError: null })

    try {
      const result = requireSuccessfulBridgekeeperResponse(
        await updateConfFile(id, null, this.state.infuraNode),
        "Updating Bridgekeeper configuration"
      )
      this.updateLog(result || "Bridgekeeper configuration updated.")
      return true
    } catch (e) {
      const message = `Unable to update Bridgekeeper configuration: ${e.message}`
      this.updateLog(message)
      this.setState({ lastError: message })
      return false
    } finally {
      this.bridgekeeperRequestInProgress = false
      if (typeof this.props.setModalLock === "function") {
        this.props.setModalLock(false)
      }
      this.setState({ loading: false })
    }
  }

  async getBridgekeeperInfo() {
    if (this.state.loading || this.bridgekeeperRequestInProgress) return false

    const activeCoin = this.props.activeCoin
    if (!activeCoin || typeof activeCoin.id !== "string") {
      const message = "Unable to load Bridgekeeper status: the active coin is unavailable."
      this.updateLog(message)
      this.setState({ lastError: message })
      return false
    }

    const { id } = activeCoin
    this.bridgekeeperRequestInProgress = true
    this.setState({ loading: true, lastError: null })

    try {
      const result = requireSuccessfulBridgekeeperResponse(
        await bridgekeeperStatus(id),
        "Loading Bridgekeeper status"
      )
      const statusAvailable =
        result != null && Number.isInteger(result.serverrunning)

      if (!statusAvailable) {
        throw new Error("Bridgekeeper status is not available yet.")
      }

      this.setState({
        bridgeKeeperActive: result.serverrunning === SERVER_OK,
        bridgeKeeperStatusAvailable: true
      })

      if (result.logs && result.logs.length > 1) {
        this.updateLog(result.logs)
      } else if (result.serverrunning === SERVER_OK) {
        this.updateLog("Bridgekeeper server running but no status information available yet...")
      } else {
        this.updateLog("No status information available yet, or bridge not running")
      }
      return true
    } catch (e) {
      const message = `Unable to load Bridgekeeper status: ${e.message}`
      this.updateLog(message)
      this.setState({
        bridgeKeeperActive: false,
        bridgeKeeperStatusAvailable: false,
        lastError: message
      })
      return false
    } finally {
      this.bridgekeeperRequestInProgress = false
      this.setState({ loading: false })
    }
  }

  render() {
    return BridgekeeperRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[STARTBRIDGEKEEPER]

  return {
    activeCoin: state.coins.activatedCoins[chainTicker],
    balances: state.ledger.balances[chainTicker],
    addresses: state.ledger.addresses[chainTicker],
    modalProps: state.modal[STARTBRIDGEKEEPER]
  };
};

export default connect(mapStateToProps)(Bridgekeeper);
