import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  CHAIN_POSTFIX,
  FIX_CHARACTER,
  SUCCESS_SNACK,
  MID_LENGTH_ALERT
} from "../../../../util/constants/componentConstants";

import {
  WalletCardRender,
  WalletTabsRender,
  CoinDeactivateDialogue,
  WalletRender
} from './wallet.render'
import { setMainNavigationPath, newSnackbar } from '../../../../actions/actionCreators'
import { deactivateCoin } from '../../../../actions/actionDispatchers'
import { getPathParent, getLastLocation } from '../../../../util/navigationUtils'
import { useStringAsKey } from '../../../../util/objectUtil';

class Wallet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinDeactivateDialogue: null
    }
    
    this.setCards = this.setCards.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.openCoin = this.openCoin.bind(this)
    this.openDashboard = this.openDashboard.bind(this)
    this.deactivate = this.deactivate.bind(this)
    this.closeDeactivateDialog = this.closeDeactivateDialog.bind(this)
    this.openDeactivateDialog = this.openDeactivateDialog.bind(this)
    this.setTabs()
    this.setCards(this.props.activatedCoins)
  }

  closeDeactivateDialog() {
    this.setState({
      coinDeactivateDialogue: null
    })
  }

  openDeactivateDialog(coin, mode) {
    this.setState({
      coinDeactivateDialogue: { coin, mode }
    })
  }

  componentDidMount() {
    if (!this.props.mainPathArray[3]) {
      const chainTickers = Object.keys(this.props.activatedCoins)
      const lastLocation = getLastLocation(
        useStringAsKey(
          this.props.mainTraversalHistory,
          this.props.mainPathArray.join(".")
        )
      );

      const lastCoin =
        lastLocation != null &&
        lastLocation.length > 0 &&
        lastLocation[0].includes(`${FIX_CHARACTER}${CHAIN_POSTFIX}`)
          ? lastLocation[0].split(FIX_CHARACTER)[0]
          : null;

      this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${
        lastCoin != null && chainTickers.includes(lastCoin) ? lastLocation[0] : DASHBOARD
      }`)) 
    } 
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.activatedCoins).length < Object.keys(this.props.activatedCoins).length) {
      this.setCards(nextProps.activatedCoins)
    }
  }
  
  componentDidUpdate(lastProps) {
    if (lastProps != this.props) {
      this.setCards(this.props.activatedCoins)
    }
  }

  /**
   * Sets the wallet coin cards by mapping over the provided activated coins
   * @param {Object} activatedCoins 
   */
  setCards(activatedCoins) {
    this.props.setCards(Object.values(activatedCoins).map((coinObj) => {
      return WalletCardRender.call(this, coinObj)
    }))
  }

  openCoin(wallet) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${wallet}${FIX_CHARACTER}${CHAIN_POSTFIX}`
      )
    );
  }

  async deactivate(chainTicker, mode) {
    this.closeDeactivateDialog()

    const { openDashboard, props } = this
    const { dispatch, mainPathArray } = props

    await deactivateCoin(chainTicker, mode, dispatch, true)
    if (mainPathArray.includes(`${chainTicker}${FIX_CHARACTER}${CHAIN_POSTFIX}`)) openDashboard()

    this.props.dispatch(newSnackbar(SUCCESS_SNACK, `${chainTicker} deactivated!`, MID_LENGTH_ALERT))
  }

  openDashboard() {
    this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${DASHBOARD}`))
  }

  setTabs() {
    this.props.setTabs(WalletTabsRender.call(this))
  }

  render() {
    return (
      <React.Fragment>
        {this.state.coinDeactivateDialogue != null
          ? CoinDeactivateDialogue.call(this)
          : null}
        {WalletRender.call(this)}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    fiatPrices: state.ledger.fiatPrices,
    fiatCurrency: state.settings.config.general.main.fiatCurrency,
    balances: state.ledger.balances,
    loggingOut: state.users.loggingOut,
    mainTraversalHistory: state.navigation.mainTraversalHistory,
    transactions: state.ledger.transactions,
    addresses: state.ledger.addresses
  };
};

export default connect(mapStateToProps)(Wallet);