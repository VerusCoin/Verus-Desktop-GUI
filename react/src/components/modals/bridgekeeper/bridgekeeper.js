import React from 'react';
import { connect } from 'react-redux';
import {
  BridgekeeperRender
} from './bridgekeeper.render';
import { appendBridgekeeperLogEntry } from './bridgekeeper.log';
import {
  ENTER_DATA,
  STARTBRIDGEKEEPER
} from "../../../util/constants/componentConstants";
import { updateConfFile, bridgekeeperStatus, getConfFile } from '../../../util/api/verusbridge/verusbridge';
const { shell } = window.bridge
const SERVER_OK = 1;
class Bridgekeeper extends React.Component {
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
      bridgeKeeperActive: false
    }

    this.getFormData = this.getFormData.bind(this)
    this.back = this.back.bind(this)
    this.getContinueDisabled = this.getContinueDisabled.bind(this)
    this.setConfFile = this.setConfFile.bind(this)
    this.getBridgekeeperInfo = this.getBridgekeeperInfo.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.openInfura = this.openInfura.bind(this)
  }

  async componentDidMount() {
    const { id } = this.props.activeCoin
    const { result } = await getConfFile(id)
    const { ethnode } = result;

    if (ethnode) this.setState({ infuraNode: ethnode });
    const statusReply = await bridgekeeperStatus(id);

    if (statusReply?.result?.serverrunning === SERVER_OK) {
      this.setState({ bridgeKeeperActive: true });
    }

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
    shell.openExternal("https://www.infura.io/")
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
    const { id } = this.props.activeCoin
    this.updateLog("Updating vETH .conf file");
    const confReply = await updateConfFile(id, null, this.state.infuraNode);
    if (confReply?.result)
      this.updateLog(confReply.result);
  }

  async getBridgekeeperInfo() {
    const { id } = this.props.activeCoin
    const statusReply = await bridgekeeperStatus(id);

    if (statusReply?.result && statusReply?.result?.logs?.length > 1) {
      this.updateLog(statusReply?.result?.logs);
    } else if (statusReply?.result && statusReply.result.serverrunning === SERVER_OK) {
      this.updateLog("Bridgekeeper server running but no status information available yet...");
    } else {
      this.updateLog("No status information available yet, or bridge not running");
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
