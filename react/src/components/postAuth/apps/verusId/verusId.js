import React from 'react';
import { connect } from 'react-redux';
import {
  DASHBOARD,
  GIFT_CARDS,
  IS_VERUS,
  ID_POSTFIX,
  NATIVE,
  ERROR_SNACK,
  SUCCESS_SNACK,
  MID_LENGTH_ALERT,
  FIX_CHARACTER,
} from "../../../../util/constants/componentConstants";
import Dashboard from './dashboard/dashboard'
import GiftCards from './giftCards/giftCards'
import {
  IdCardRender,
  IdTabsRender
} from './verusId.render'
import { setMainNavigationPath, newSnackbar } from '../../../../actions/actionCreators'
import { getPathParent, getLastLocation } from '../../../../util/navigationUtils'
import FormDialog from '../../../../containers/FormDialog/FormDialog'
import { getIdentity } from '../../../../util/api/wallet/walletCalls'
import { openIdentityCard } from '../../../../actions/actionDispatchers';
import { useStringAsKey } from '../../../../util/objectUtil';
import CoinWallet from '../wallet/coinWallet/coinWallet';
import { Typography } from "@material-ui/core";
import WalletPaper from '../../../../containers/WalletPaper/WalletPaper';
import HelpIcon from '@material-ui/icons/Help';

const COMPONENT_MAP = {
  [DASHBOARD]: <Dashboard />,
  [GIFT_CARDS]: <GiftCards />,
}

class VerusId extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeId: {
        chainTicker: null,
        idIndex: null,
        idSearchOpen: false,
        idSearchTerm: '',
        loading: false,
        searchChain: null
      }
    }
    
    this.setCards = this.setCards.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.openId = this.openId.bind(this)
    this.openDashboard = this.openDashboard.bind(this)
    this.openGiftCards = this.openGiftCards.bind(this)
    this.updateSearchTerm = this.updateSearchTerm.bind(this)
    this.closeSearchModal = this.closeSearchModal.bind(this)
    this.openSearchModal = this.openSearchModal.bind(this)
    this.onIdSearchSubmit = this.onIdSearchSubmit.bind(this)
    this.getIdentityTransactions = this.getIdentityTransactions.bind(this)
    this.setTabs()
  }

  componentDidMount() {
    //Set default navigation path to dashboard if wallet is opened without a sub-navigation location
    //if (!this.props.mainPathArray[3]) this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${DASHBOARD}`)) 

    if (!this.props.mainPathArray[3]) {
      const chainTickers = Object.keys(this.props.identities)
      const lastLocation = getLastLocation(
        useStringAsKey(
          this.props.mainTraversalHistory,
          this.props.mainPathArray.join(".")
        )
      );

      if (
        lastLocation != null &&
        lastLocation.length > 0 &&
        lastLocation[0].includes(`${FIX_CHARACTER}${ID_POSTFIX}`)
      ) {
        const lastLocationData = lastLocation[0].split(FIX_CHARACTER);
        const coinId = lastLocationData[1];
        const identityIndex = lastLocationData[0];

        this.props.dispatch(
          setMainNavigationPath(
            `${this.props.mainPathArray.join("/")}/${
              chainTickers.includes(coinId) &&
              this.props.identities[coinId].length > identityIndex
                ? lastLocation[0]
                : DASHBOARD
            }`
          )
        );
      } else
        this.props.dispatch(
          setMainNavigationPath(
            `${this.props.mainPathArray.join("/")}/${DASHBOARD}`
          )
        );
    } 
  }

  updateSearchTerm(term) {
    this.setState({ idSearchTerm: term })
  }

  closeSearchModal() {
    this.setState({ idSearchOpen: false })
  }

  openSearchModal(chain) {
    this.setState({ idSearchOpen: true, searchChain: chain })
  }

  onIdSearchSubmit() {
    this.setState({loading: true}, () => {
      getIdentity(NATIVE, this.state.searchChain, this.state.idSearchTerm)
      .then(res => {
        if (res.msg === 'success') {
          this.props.dispatch(newSnackbar(SUCCESS_SNACK, `${this.state.idSearchTerm} ID found!`, MID_LENGTH_ALERT))
          openIdentityCard(res.result, this.state.searchChain)
          this.setState({ loading: false, idSearchOpen: false, idSearchTerm: '' })
        } else {
          this.props.dispatch(newSnackbar(ERROR_SNACK, res.result))
          this.setState({ loading: false })
        }
      })
      .catch(err => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, err.message))
        this.setState({ loading: false })
      })
    })
  }

  componentWillReceiveProps(nextProps) {
    if (
      Object.keys(nextProps.activatedCoins).length <
        Object.keys(this.props.activatedCoins).length ||
      nextProps.mainPathArray != this.props.mainPathArray
    ) {
      this.setCards(nextProps.activatedCoins);
    }
  }
  
  componentDidUpdate(lastProps) {
    if (lastProps != this.props) {
      this.setCards(this.props.activatedCoins)
    }
  }

  /**
   * Sets the wallet coin cards by mapping over the provided identity compatible coins
   * @param {Object} activatedCoins 
   */
  setCards(activatedCoins) {
    const { setCards, mainPathArray, identities } = this.props
    const walletApp = mainPathArray[3] ? mainPathArray[3] : null
    
    const updateCards = () => {
      const verusProtocolCoins = Object.values(activatedCoins).filter((coinObj) => {
        return (coinObj.options.tags.includes(IS_VERUS) && coinObj.mode === NATIVE)
      })
  
      setCards(verusProtocolCoins.map((coinObj) => {
        return IdCardRender.call(this, coinObj)
      }))
    }

    if (walletApp) {
      const pathDestination = walletApp.split(FIX_CHARACTER) 
      let activeId = {chainTicker: null, idIndex: null}

      if (pathDestination.length > 2 && pathDestination[2] === ID_POSTFIX) {
        const idIndex = pathDestination[0]
        const chainTicker = pathDestination[1]

        if (identities[chainTicker] != null && identities[chainTicker][idIndex] != null) {
          activeId = { chainTicker, idIndex }
        } 
      } 

      this.setState({ activeId }, updateCards)
    } else updateCards()
  }

  openId(chainTicker, idIndex) {
    this.props.dispatch(
      setMainNavigationPath(
        `${getPathParent(
          this.props.mainPathArray
        )}/${idIndex}${FIX_CHARACTER}${chainTicker}${FIX_CHARACTER}${ID_POSTFIX}`
      )
    );
  }

  openDashboard() {
    this.setState({
      activeId: {
        chainTicker: null,
        idIndex: null
      }
    }, () => {
      this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${DASHBOARD}`))
    })
  }

  openGiftCards() {
    this.setState({
      activeId: {
        chainTicker: null,
        idIndex: null
      }
    }, () => {
      this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${GIFT_CARDS}`))
    })
  }

  setTabs() {
    this.props.setTabs(IdTabsRender.call(this))
  }

  getIdentityTransactions(transactions, identity) {
    if (!identity || !transactions) return [];
    let txIndexes = []

    const pubAddrs = identity.addresses.public.map(addrObj => addrObj.address);
    const privAddrs = identity.addresses.private.map(addrObj => addrObj.address);

    return transactions.filter((tx, index) => {
      if (tx.address != null && (pubAddrs.includes(tx.address) || privAddrs.includes(tx.address))) {
        txIndexes.push(index)
        return true
      } else return false
    }).map((tx, index) => {return {...tx, txIndex: txIndexes[index]}});
  }

  render() {
    const { activeId } = this.state
    const walletApp = this.props.mainPathArray[3] ? this.props.mainPathArray[3] : null
    let component = null

    if (walletApp) {
      if (COMPONENT_MAP[walletApp]) component = COMPONENT_MAP[walletApp]
      else {
        if (activeId.idIndex != null && activeId.chainTicker != null) {
          const activeIdentity = this.props.identities[activeId.chainTicker]
            ? JSON.parse(JSON.stringify(this.props.identities[activeId.chainTicker][activeId.idIndex])) // Deep copy
            : null;

          if (!activeIdentity) {
            component = (
              <div
                className="col-md-8 col-lg-9"
                style={{
                  padding: 16,
                  width: "80%",
                  overflow: "scroll",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <WalletPaper
                  style={{
                    marginBottom: 16,
                    padding: 8,
                    paddingTop: 32,
                    paddingBottom: 32,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <HelpIcon color="primary" style={{ fontSize: 96 }} />
                  <Typography style={{ fontWeight: "bold", textAlign: "center", marginTop: 16 }}>
                    {"Can not get information for this VerusID (are you sure you own it?)"}
                  </Typography>
                </WalletPaper>
              </div>
            );
          } else {
            for (const currency in activeIdentity.balances.reserve) {
              if (
                activeIdentity.balances.reserve[currency] != null &&
                !isNaN(activeIdentity.balances.reserve[currency])
              ) {
                activeIdentity.balances.reserve[currency] = {
                  public: {
                    confirmed: activeIdentity.balances.reserve[currency],
                  },
                  private: {},
                };
              }
            }

            if (activeIdentity.addresses.private.length > 0) {
              activeIdentity.balances.native.private.confirmed = 0;

              for (let i = 0; i < activeIdentity.addresses.private.length; i++) {
                const privAddr =
                  this.props.addresses[activeId.chainTicker] == null
                    ? null
                    : this.props.addresses[activeId.chainTicker].private.find(
                        (x) => x.address === activeIdentity.addresses.private[i].address
                      );

                if (privAddr) {
                  activeIdentity.addresses.private[i].balances.native = privAddr.balances.native;

                  activeIdentity.balances.native.private.confirmed +=
                    activeIdentity.addresses.private[i].balances.native;
                }
              }
            }

            component = (
              <CoinWallet
                coin={activeId.chainTicker}
                balances={activeIdentity.balances}
                addresses={activeIdentity.addresses}
                transactions={this.getIdentityTransactions(
                  this.props.transactions[activeId.chainTicker],
                  activeIdentity
                )}
                activeIdentity={activeIdentity}
              />
            );
          }
        }
      }
    }

    return (
      <React.Fragment>
        <FormDialog
          open={this.state.idSearchOpen}
          title={`Search ${this.state.searchChain} IDs`}
          value={this.state.idSearchTerm}
          onChange={this.updateSearchTerm}
          onCancel={this.closeSearchModal}
          onSubmit={this.onIdSearchSubmit}
          disabled={this.state.loading}
        />
        { component }
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
    experimentalFeatures: state.settings.config.general.main.experimentalFeatures,
    identities: state.ledger.identities,
    nameCommitments: state.ledger.nameCommitments,
    activeUser: state.users.activeUser,
    transactions: state.ledger.transactions,
    addresses: state.ledger.addresses,
    mainTraversalHistory: state.navigation.mainTraversalHistory
  };
};

export default connect(mapStateToProps)(VerusId);