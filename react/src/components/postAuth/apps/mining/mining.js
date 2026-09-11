import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  NATIVE,
  MINING_POSTFIX,
  MS_MERGE_MINING_STAKING,
  MS_MINING_STAKING,
  MS_MINING,
  MS_STAKING,
  MS_MERGE_MINING,
  MS_OFF,
  MS_IDLE,
  ERROR_SNACK,
  MID_LENGTH_ALERT,
  API_GET_MININGINFO,
  MINING_FUNCTIONS,
  API_ERROR,
  FIX_CHARACTER
} from "../../../../util/constants/componentConstants";
import Dashboard from './dashboard/dashboard'
import MiningWallet from './miningWallet/miningWallet'
import {
  MiningCardRender,
  MiningTabsRender
} from './mining.render'
import Store from '../../../../store'
import {
  setMainNavigationPath,
  expireData,
  newSnackbar,
  startLoadingMiningFunctions,
  finishLoadingMiningFunctions,
} from "../../../../actions/actionCreators";
import { getPathParent, getLastLocation } from '../../../../util/navigationUtils'
import { stopStaking, startStaking, stopMining, startMining } from '../../../../util/api/wallet/walletCalls';
import { conditionallyUpdateWallet } from '../../../../actions/actionDispatchers';
import { useStringAsKey } from '../../../../util/objectUtil';
import { startBridgekeeperprocess, stopBridgekeeperprocess, bridgekeeperStatus } from '../../../../util/api/verusbridge/verusbridge';

export const requireSuccessfulMiningResponse = (response, operation) => {
  if (response && response.msg === API_ERROR) {
    throw new Error(response.result || `${operation} failed.`)
  }

  return response
}

export class Mining extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nativeCoins: [],
      miningStates: {}
    }

    this.miningStateDescs = {
      [MS_IDLE]: "Loading...",
      [MS_OFF]: "Mining/Staking Off",
      [MS_STAKING]: "Staking",
      [MS_MINING]: "Mining",
      [MS_MINING_STAKING]: "Mining & Staking",
      [MS_MERGE_MINING]: "Merge Mining",
      [MS_MERGE_MINING_STAKING]: "Merge Mining & Staking"
    }
    
    this.setCards = this.setCards.bind(this)
    this.calculateMiningStates = this.calculateMiningStates.bind(this)
   // this.getBridgingStates = this.getBridgingStates.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.openDashboard = this.openDashboard.bind(this)
    this.getNativeCoins = this.getNativeCoins.bind(this)
    this.openCoin = this.openCoin.bind(this)
    this.handleThreadChange = this.handleThreadChange.bind(this)
    this.toggleStaking = this.toggleStaking.bind(this)
    this.toggleBridging = this.toggleBridging.bind(this)
    this.setTabs()
  }

  componentDidMount() {
    if (!this.props.mainPathArray[3]) {
      this.getNativeCoins(this.props.activatedCoins, () => {
        const lastLocation = getLastLocation(
          useStringAsKey(
            this.props.mainTraversalHistory,
            this.props.mainPathArray.join(".")
          )
        );
  
        const lastCoin =
          lastLocation != null &&
          lastLocation.length > 0 &&
          lastLocation[0].includes(`${FIX_CHARACTER}${MINING_POSTFIX}`)
            ? lastLocation[0].split(FIX_CHARACTER)[0]
            : null;
  
        this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${
          lastCoin != null && this.state.nativeCoins.includes(lastCoin) ? lastLocation[0] : DASHBOARD
        }`)) 
      })
    }
    
    this.calculateMiningStates(this.props.activatedCoins)
  }

  async toggleStaking(chainTicker) {
    const { miningInfo, dispatch } = this.props

    if (miningInfo[chainTicker]) {
      try {
        this.props.dispatch(startLoadingMiningFunctions(chainTicker))
        
        // Try to dispatch call to stop or start staking
        if (miningInfo[chainTicker].staking) {
          requireSuccessfulMiningResponse(
            await stopStaking(NATIVE, chainTicker),
            "Stopping staking"
          )
        } else {
          requireSuccessfulMiningResponse(
            await startStaking(NATIVE, chainTicker),
            "Starting staking"
          )
        }

        // If successful, expire mining data and update all other expired data
        dispatch(expireData(chainTicker, API_GET_MININGINFO))
        if (
          (await conditionallyUpdateWallet(
            Store.getState(),
            dispatch,
            NATIVE,
            chainTicker,
            API_GET_MININGINFO
          )) === API_ERROR
        ) {
          throw new Error("Failed to update mining status.")
        } else this.props.dispatch(finishLoadingMiningFunctions(chainTicker))

      } catch (e) {
        // If failed, cancel loading
        this.props.dispatch(finishLoadingMiningFunctions(chainTicker))
        dispatch(newSnackbar(ERROR_SNACK, e.message, MID_LENGTH_ALERT))
      }
    }
  }

  async toggleBridging(chainTicker) {
    const { miningInfo, dispatch } = this.props
    let reply = {};
    const SERVER_OFF = 0;
    let loadingStarted = false

    try {
      const chainMiningInfo = miningInfo && miningInfo[chainTicker]
      const bridgekeeperState = chainMiningInfo && chainMiningInfo.bridgekeeperstatus

      if (
        bridgekeeperState == null ||
        !Number.isInteger(bridgekeeperState.serverrunning)
      ) {
        throw new Error("Bridgekeeper status is not available yet.")
      }

      this.props.dispatch(startLoadingMiningFunctions(chainTicker))
      loadingStarted = true
        
      if (bridgekeeperState.serverrunning !== SERVER_OFF) {
        reply = await stopBridgekeeperprocess(chainTicker);
      } else {
        reply = await startBridgekeeperprocess(chainTicker);
      }
      requireSuccessfulMiningResponse(reply, "Updating Bridgekeeper")

      dispatch(expireData(chainTicker, API_GET_MININGINFO))
      if (
        (await conditionallyUpdateWallet(
          Store.getState(),
          dispatch,
          NATIVE,
          chainTicker,
          API_GET_MININGINFO
        )) === API_ERROR
      ) {
        throw new Error("Failed to update mining status.")
      }

      return true
    } catch (e) {
      dispatch(newSnackbar(ERROR_SNACK, e.message, MID_LENGTH_ALERT))
      return false
    } finally {
      if (loadingStarted) {
        this.props.dispatch(finishLoadingMiningFunctions(chainTicker))
      }
    }
  }

  // Dispatch call to stop or start mining, then expire and update mining data
  async handleThreadChange(event, chainTicker) {
    const newThreads = event.target.value
    const { dispatch, miningInfo } = this.props

    if (
      miningInfo[chainTicker] &&
      (newThreads !== miningInfo[chainTicker].numthreads || 
      (!miningInfo[chainTicker].generate && newThreads > 0))
    ) {
      try {
        this.props.dispatch(startLoadingMiningFunctions(chainTicker));

        // Try to dispatch call to stop or start mining
        if (newThreads === 0) {
          requireSuccessfulMiningResponse(
            await stopMining(NATIVE, chainTicker),
            "Stopping mining"
          );
        } else {
          requireSuccessfulMiningResponse(
            await startMining(NATIVE, chainTicker, newThreads),
            "Starting mining"
          );
        }

        // If successful, expire mining data and update all other expired data
        dispatch(expireData(chainTicker, API_GET_MININGINFO));
        if (
          (await conditionallyUpdateWallet(
            Store.getState(),
            dispatch,
            NATIVE,
            chainTicker,
            API_GET_MININGINFO
          )) === API_ERROR
        ) {
          throw new Error("Failed to update mining status.");
        } else this.props.dispatch(finishLoadingMiningFunctions(chainTicker));
      } catch (e) {
        // If failed, cancel loading
        this.props.dispatch(finishLoadingMiningFunctions(chainTicker));
        dispatch(newSnackbar(ERROR_SNACK, e.message, MID_LENGTH_ALERT));
      }
    }
  }

  /*componentWillReceiveProps(nextProps) {
    if (nextProps != this.props) {
      this.calculateMiningStates(nextProps.activatedCoins)
      this.setCards(nextProps.activatedCoins);
    } 
  }*/
  
  componentDidUpdate(lastProps) {
    if (lastProps != this.props) {
      this.calculateMiningStates(this.props.activatedCoins)
    }
  }

  // Calculates the native coins given the current activated coins
  // and activates the callback function once the state has been changed
  getNativeCoins(activatedCoins, cb) {
    this.setState({ nativeCoins: Object.keys(activatedCoins).filter((chainTicker) => {
      return activatedCoins[chainTicker].mode === NATIVE
    })}, () => cb())
  }

  /**
   * Sets the mining coin cards by mapping over the provided coins activated in native mode
   * @param {Object} activatedCoins 
   */
  setCards(activatedCoins) {
    this.getNativeCoins(activatedCoins, () => {
      this.props.setCards(this.state.nativeCoins.map((chainTicker) => {
        return MiningCardRender.call(this, activatedCoins[chainTicker])
      }))
    })
  }

  calculateMiningStates(activatedCoins) {
    const { miningInfo } = this.props
    let miningStates = {}

    this.getNativeCoins(activatedCoins, () => {
      this.state.nativeCoins.map((chainTicker) => {
        const coinObj = activatedCoins[chainTicker]

        if (miningInfo[coinObj.id]) {
          const { mergemining, staking, generate, numthreads } = miningInfo[coinObj.id]
          const mergeMining = mergemining != null && mergemining > 0
          const mining = generate && numthreads
  
          if (staking && mergeMining) miningStates[coinObj.id] = MS_MERGE_MINING_STAKING
          else if (staking && mining) miningStates[coinObj.id] = MS_MINING_STAKING
          else if (mergeMining) miningStates[coinObj.id] = MS_MERGE_MINING
          else if (mining) miningStates[coinObj.id] = MS_MINING
          else if (staking) miningStates[coinObj.id] = MS_STAKING
          else miningStates[coinObj.id] = MS_OFF
        } else {
          miningStates[coinObj.id] = MS_IDLE
        }
      })

      this.setState({ miningStates }, () => {
        this.setCards(activatedCoins)
      })
    })
  }

  openDashboard() {
    this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${DASHBOARD}`))
  }

  setTabs() {
    this.props.setTabs(MiningTabsRender.call(this))
  }

  openCoin(wallet) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${wallet}${FIX_CHARACTER}${MINING_POSTFIX}`
      )
    );
  }

  render() {
    const walletApp = this.props.mainPathArray[3] ? this.props.mainPathArray[3] : null

    if (walletApp) {
      if (walletApp === DASHBOARD)
        return (
          <Dashboard
            miningStates={this.state.miningStates}
            nativeCoins={this.state.nativeCoins}
            miningStateDescs={this.miningStateDescs}
            openCoin={this.openCoin}
            handleThreadChange={this.handleThreadChange}
            toggleStaking={this.toggleStaking}
            loadingCoins={this.props.loading}
            miningInfo={this.props.miningInfo}
            miningInfoErrors={this.props.miningInfoErrors}
          />
        );
      else {
        const pathDestination = walletApp.split(FIX_CHARACTER);

        if (pathDestination.length > 1 && pathDestination[1] === MINING_POSTFIX)
          return (
            <MiningWallet
              miningState={
                this.state.miningStates[pathDestination[0]] == null
                  ? MS_IDLE
                  : this.state.miningStates[pathDestination[0]]
              }
              coin={pathDestination[0]}
              loading={this.props.loading[pathDestination[0]]}
              handleThreadChange={this.handleThreadChange}
              toggleStaking={this.toggleStaking}
              miningInfo={this.props.miningInfo[pathDestination[0]]}
              miningInfoErrors={this.props.miningInfoErrors[pathDestination[0]]}
              toggleBridging={this.toggleBridging}
            />
          );
      }
    }

    return null
  }
}

const mapStateToProps = (state) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    miningInfo: state.ledger.miningInfo,
    balances: state.ledger.balances,
    miningInfoErrors: state.errors[API_GET_MININGINFO],
    loading: state.loading[MINING_FUNCTIONS],
    mainTraversalHistory: state.navigation.mainTraversalHistory
  };
};

export default connect(mapStateToProps)(Mining);
