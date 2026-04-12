import React from 'react';
import { connect } from 'react-redux';
import { 
  CoinWalletRender,
} from './coinWallet.render';
import { 
  CONFIRMED_BALANCE, 
  IMMATURE_BALANCE, 
  RESERVE_BALANCE,
  STAKING_BALANCE,
  NATIVE,
  API_GET_BALANCES,
  API_GET_TRANSACTIONS,
  API_GET_FIATPRICE,
  API_GET_INFO,
  SYNCING_CHAIN,
  WALLET_CONNECTED,
  PUBLIC_BALANCE,
  CONNECTING_TO_PEERS,
  OPERATION_INFO,
  FINDING_LONGEST_CHAIN,
  UNCONFIRMED_BALANCE,
  INTEREST_BALANCE,
  BLACKLISTS,
  WHITELISTS,
  SUCCESS_SNACK,
  ERROR_SNACK,
  MID_LENGTH_ALERT,
  POST_AUTH,
  APPS,
  MULTIVERSE,
  API_GET_CURRENCY_DATA_MAP,
  BASIC_MODAL,
  API_GET_RESERVE_TRANSFERS,
  INFO_SNACK
} from '../../../../../util/constants/componentConstants'
import {
  setUserPreferredCurrency,
  newSnackbar,
  setMainNavigationPath,
} from "../../../../../actions/actionCreators";

//TODO: Use these to update on mount conditionally
import {
  conditionallyUpdateWallet,
  openModal,
  openCurrencyCard,
  restartCoinInPlace,
  openTextDialog,
  closeTextDialog,
} from "../../../../../actions/actionDispatchers";
import Store from '../../../../../store'
import { getCurrency } from '../../../../../util/api/wallet/walletCalls';
import { getCurrencyInfo } from '../../../../../util/multiverse/multiverseCurrencyUtils';
import { setIdTimelock } from '../../../../../util/api/wallet/writeCalls/setIdTimelock';

const CONDITIONAL_UPDATES = [
  API_GET_BALANCES,
  API_GET_TRANSACTIONS,
  API_GET_FIATPRICE,
  API_GET_INFO,
  API_GET_CURRENCY_DATA_MAP,
  API_GET_RESERVE_TRANSFERS
];

class CoinWallet extends React.Component {
  constructor(props) {
    super(props);
    this.NO_HEIGHT = -1;
    this.calculateCurrencyData = this.calculateCurrencyData.bind(this);

    this.state = {
      walletDisplayBalances: [
        {
          balanceAddrType: PUBLIC_BALANCE,
          balanceType: CONFIRMED_BALANCE,
          balance: "-",
          balanceFiat: "-",
          unusable: false,
          fundable: false,
        },
      ],
      spendableBalance: {
        crypto: 0,
        fiat: 0.0,
      },
      pendingBalance: {
        crypto: 0,
        fiat: 0.0,
      },
      walletLoadState: {
        message: "Loading...",
        error: false,
        percentage: 0,
      },
      chevronVisible: false,
      currencySearchTerm: "",
      loadingCurrency: false,
      currencyInfo: this.calculateCurrencyData(props, props.selectedCurrency),
    };

    this.calculateBalances = this.calculateBalances.bind(this);
    this.calculateLoadState = this.calculateLoadState.bind(this);
    this.initState = this.initState.bind(this);
    this.openModal = this.openModal.bind(this);
    this.openOpInfo = this.openOpInfo.bind(this);
    this.setInput = this.setInput.bind(this);
    this.updateCurrencySearchTerm = this.updateCurrencySearchTerm.bind(this);
    this.onCurrencySearchSubmit = this.onCurrencySearchSubmit.bind(this);
    this.setPreferredCurrency = this.setPreferredCurrency.bind(this);
    this.openMultiverse = this.openMultiverse.bind(this);
    this.ensureSelectedCurrencyExists = this.ensureSelectedCurrencyExists.bind(this);
    this.tryNativeRelaunch = this.tryNativeRelaunch.bind(this);
    this.openUnlockIdentityModal = this.openUnlockIdentityModal.bind(this);
    this.unlockIdentity = this.unlockIdentity.bind(this);
    this.displayCurrencyInfo = this.displayCurrencyInfo.bind(this);
  }

  updateCurrencySearchTerm(term) {
    this.setState({ currencySearchTerm: term });
  }

  initState() {
    this.ensureSelectedCurrencyExists();
    this.calculateBalances();
    this.calculateLoadState();
  }

  async tryNativeRelaunch() {
    const activeCoin = this.props.activatedCoins[this.props.coin];
    const startParams =
      this.props.startupOptions != null && this.props.startupOptions[NATIVE][activeCoin.id] != null
        ? this.props.startupOptions[NATIVE][activeCoin.id]
        : [];

    try {
      this.props.dispatch(newSnackbar(INFO_SNACK, "Restarting coin daemon, please wait..."));
      await restartCoinInPlace(activeCoin, activeCoin.mode, startParams, this.props.dispatch);
      this.props.dispatch(newSnackbar(SUCCESS_SNACK, "Daemon relaunched successfully!"));
    } catch (e) {
      this.props.dispatch(newSnackbar(ERROR_SNACK, e.message));
    }
  }

  calculateCurrencyData(props, currency) {
    return props.currencyDataMap[currency]
      ? getCurrencyInfo(
          props.currencyDataMap[currency],
          props.info && props.info.longestchain ? props.info.longestchain : this.NO_HEIGHT,
          props.identities
        )
      : null;
  }

  openUnlockIdentityModal() {
    const timelock = this.props.activeIdentity.identity.timelock;

    openTextDialog(
      closeTextDialog,
      [
        {
          title: "No",
          onClick: () => {
            closeTextDialog();
          },
        },
        {
          title: "Yes",
          onClick: () => {
            closeTextDialog();
            this.unlockIdentity();
          },
        },
      ],
      `Are you sure you would like to start unlocking this identity? If you do, it will unlock in ${
        timelock + 20
      } blocks.`,
      "Start Unlock?"
    );
  }

  async unlockIdentity() {
    try {
      const activeCoin = this.props.activatedCoins[this.props.coin];

      const res = await setIdTimelock(
        activeCoin.mode,
        activeCoin.id,
        this.props.activeIdentity.identity.identityaddress,
        { unlockatblock: 0 }
      );

      if (res.msg === "success") {
        this.props.dispatch(
          newSnackbar(
            SUCCESS_SNACK,
            `Identity unlock started! (txid: ${res.result}) This may take a few minutes to confirm.`
          )
        );
      } else {
        throw new Error(res.result);
      }
    } catch (e) {
      this.props.dispatch(newSnackbar(ERROR_SNACK, e.message));
    }
  }

  openModal(e, modalParams = {}, modal, modalType = BASIC_MODAL) {
    const _modal = modal ? modal : e.target.name;
    openModal(_modal, { chainTicker: this.props.coin, ...modalParams }, modalType);
  }

  openMultiverse() {
    this.props.dispatch(setMainNavigationPath(`${POST_AUTH}/${APPS}/${MULTIVERSE}`));
  }

  openOpInfo(rowData) {
    const { zOperations } = this.props;
    this.openModal(null, { opObj: zOperations[rowData.opIndex] }, OPERATION_INFO);
  }

  setPreferredCurrency(currency) {
    this.props.dispatch(setUserPreferredCurrency(this.props.coin, currency));
  }

  componentDidMount() {
    if (this.props.activatedCoins[this.props.coin].mode !== NATIVE) {
      this.setPreferredCurrency(this.props.coin);
    }

    this.initState();
  }

  onCurrencySearchSubmit() {
    this.setState({ loadingCurrency: true }, () => {
      this.displayCurrencyInfo(this.state.currencySearchTerm);
    });
  }

  displayCurrencyInfo(currency) {
    getCurrency(NATIVE, this.props.coin, currency)
      .then((res) => {
        if (res.msg === "success") {
          openCurrencyCard(res.result, this.props.coin, this.props.identities[this.props.coin]);
          this.setState({ loadingCurrency: false, currencySearchTerm: "" });
        } else {
          this.props.dispatch(newSnackbar(ERROR_SNACK, res.result));
          this.setState({ loadingCurrency: false });
        }
      })
      .catch((err) => {
        this.props.dispatch(newSnackbar(ERROR_SNACK, err.message));
        this.setState({ loadingCurrency: false });
      });
  }

  ensureSelectedCurrencyExists() {
    const { coin, whitelists, selectedCurrency } = this.props;
    const whitelist = whitelists[coin] || [];

    if (selectedCurrency !== coin && !whitelist.includes(selectedCurrency)) {
      this.setPreferredCurrency(coin);
    }
  }

  componentDidUpdate(lastProps) {
    if (this.props != lastProps) {
      if (this.props.activatedCoins[this.props.coin]) {
        if (this.props.coin != lastProps.coin) {
          const stateSnapshot = Store.getState();
          const { dispatch, coin, activatedCoins } = this.props;
          const activeCoin = activatedCoins[coin];
          const { mode, id } = activeCoin;

          CONDITIONAL_UPDATES.map((updateId) => {
            conditionallyUpdateWallet(stateSnapshot, dispatch, mode, id, updateId);
          });
        }

        this.initState();
      }

      if (this.props.whitelists !== lastProps.whitelists) {
        this.ensureSelectedCurrencyExists();
      }

      if (
        this.props.selectedCurrency !== lastProps.selectedCurrency ||
        this.props.currencyDataMap !== lastProps.currencyDataMap ||
        this.props.identities !== lastProps.identities
      ) {
        this.setState({
          currencyInfo: this.calculateCurrencyData(this.props, this.props.selectedCurrency),
        });
      }
    }
  }

  calculateBalances() {
    let spendableBalance = {
      crypto: 0,
      fiat: null,
    };
    let pendingBalance = {
      crypto: 0,
      fiat: null,
    };

    let walletDisplayBalances = [];
    const chainTicker = this.props.coin;
    const balances = this.props.balances;

    if (balances) {
      const fiatPrices = this.props.fiatPrices;
      const fiatCurrency = this.props.fiatCurrency;

      for (let balanceCurrency in balances) {
        const currencyBalances = balances[balanceCurrency];

        const parseBalances = (balanceObj, currency) => {
          for (let balanceAddrType in balanceObj) {
            for (let balanceType in balanceObj[balanceAddrType]) {
              const balance = balanceObj[balanceAddrType][balanceType];

              if (balance != null && balanceType !== STAKING_BALANCE) {
                if (currency === chainTicker) {
                  if (balanceType !== INTEREST_BALANCE) pendingBalance.crypto += balance;

                  if (balanceType === CONFIRMED_BALANCE) {
                    spendableBalance.crypto += balance;
                  }
                }

                if (
                  (balance != 0 || balanceType === CONFIRMED_BALANCE) &&
                  balanceType != UNCONFIRMED_BALANCE
                ) {
                  walletDisplayBalances.push({
                    currency,
                    balanceAddrType,
                    balanceType,
                    balance,
                    balanceFiat: "-",
                    sendable: balanceType === IMMATURE_BALANCE ? false : true,
                    receivable:
                      balanceType === IMMATURE_BALANCE || balanceType === INTEREST_BALANCE
                        ? false
                        : true,
                  });
                }
              }
            }
          }
        };

        if (balanceCurrency === RESERVE_BALANCE) {
          for (let currency in currencyBalances)
            parseBalances(currencyBalances[currency], currency);
        } else {
          parseBalances(currencyBalances, chainTicker);
        }
      }

      if (fiatPrices && fiatPrices[fiatCurrency]) {
        const fiatPrice = fiatPrices[fiatCurrency];
        spendableBalance.fiat = (spendableBalance.crypto * fiatPrice).toFixed(2);
        pendingBalance.fiat = (pendingBalance.crypto * fiatPrice).toFixed(2);

        walletDisplayBalances = walletDisplayBalances.map((balanceObj) => {
          return {
            ...balanceObj,
            balanceFiat: (balanceObj.balance * fiatPrice).toFixed(2),
          };
        });
      }
    }

    this.setState({
      spendableBalance,
      pendingBalance,
      chevronVisible: walletDisplayBalances.length > 4,
      walletDisplayBalances,
    });
  }

  calculateLoadState() {
    const { props } = this;
    const { errors, activatedCoins, coin } = props;
    const activeCoin = activatedCoins[coin];
    const chainTicker = activeCoin.id;

    let walletLoadState = {
      message: "Loading...",
      error: false,
      percentage: 0,
    };

    if (activeCoin) {
      if (activeCoin.mode === NATIVE) {
        const infoError = errors[API_GET_INFO][chainTicker];

        if (!infoError || !infoError.error) {
          const { info } = this.props;

          if (info) {
            const { connections, longestchain, blocks } = info;
            const percentage =
              longestchain == null
                ? this.NO_HEIGHT
                : longestchain < blocks || longestchain === 0
                ? 0
                : Math.floor(((blocks / longestchain) * 10000) / 100 );

            walletLoadState = {
              ...walletLoadState,
              message:
                percentage < 100
                  ? `${SYNCING_CHAIN} (${blocks} blocks)`
                  : connections === 0
                  ? CONNECTING_TO_PEERS
                  : longestchain < blocks
                  ? FINDING_LONGEST_CHAIN
                  : `${WALLET_CONNECTED} (${blocks} blocks)`,
              percentage: connections === 0 ? 0 : percentage,
            };
          }
        } else {
          walletLoadState = {
            ...walletLoadState,
            message: infoError.result,
            percentage: 0,
            error: true,
          };
        }
      } else {
        const balancesError = errors[API_GET_BALANCES][chainTicker];

        if (!balancesError || !balancesError.error) {
          walletLoadState = {
            ...walletLoadState,
            message: WALLET_CONNECTED,
            percentage: 100,
          };
        } else {
          walletLoadState = {
            ...walletLoadState,
            message: balancesError.result,
            percentage: 0,
            error: true,
          };
        }
      }
    }

    this.setState({ walletLoadState });
  }

  setInput(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return CoinWalletRender.call(this);
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    fiatPrices: state.ledger.fiatPrices[ownProps.coin],
    fiatCurrency: state.settings.config.general.main.fiatCurrency,
    zOperations: state.ledger.zOperations[ownProps.coin],
    info: state.ledger.info[ownProps.coin],
    identities: state.ledger.identities[ownProps.coin],
    errors: state.errors,
    blacklists: state.localCurrencyLists[BLACKLISTS],
    whitelists: state.localCurrencyLists[WHITELISTS],
    selectedCurrency:
      state.users.activeUser.selectedCurrencyMap[ownProps.coin] == null
        ? ownProps.coin
        : state.users.activeUser.selectedCurrencyMap[ownProps.coin],
    currencyDataMap: state.ledger.currencyDataMap[ownProps.coin] || {},
    multiverseNameMap: state.ledger.multiverseNameMap[ownProps.coin],
    filterGenerateTransactions: state.settings.config.general.native.filterGenerateTransactions,
    startupOptions: state.users.activeUser.startupOptions
  };
};

export default connect(mapStateToProps)(CoinWallet);