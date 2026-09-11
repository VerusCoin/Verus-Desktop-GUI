import React from 'react';
import { connect } from 'react-redux';
import { 
  UxSelectorRender,
} from './uxSelector.render';
import { setMainNavigationPath, newSnackbar } from '../../../actions/actionCreators'
import { activateCoin } from '../../../actions/actionDispatchers'

import {
  NATIVE,
  POST_AUTH,
  UX_SELECTOR,
  CHAIN_POSTFIX,
  APPS,
  WALLET,
  ID_POSTFIX,
  FIX_CHARACTER,
  VERUSID,
  MINING_POSTFIX,
  MINING,
  API_SUCCESS,
  ERROR_SNACK,
  MID_LENGTH_ALERT,
  PBAAS_POSTFIX,
  MULTIVERSE
} from "../../../util/constants/componentConstants";
import { checkAuthentication } from '../../../util/api/users/userData';

export const parseIdentityNavigationSegment = (segment) => {
  if (typeof segment !== "string") return null

  const parts = segment.split(FIX_CHARACTER)
  if (
    parts.length !== 3 ||
    !/^(0|[1-9][0-9]*)$/.test(parts[0]) ||
    parts[1].length === 0 ||
    parts[2] !== ID_POSTFIX
  ) {
    return null
  }

  return {
    identityIndex: Number(parts[0]),
    chainTicker: parts[1]
  }
}

export class UxSelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    }
    this.selecting = false

    this.selectUx = this.selectUx.bind(this)
  }

  componentDidMount() {
    const { activeUser } = this.props

    if (activeUser.startLocation !== `${POST_AUTH}/${UX_SELECTOR}`) {
      this.selectUx(activeUser.startLocation)
    }
  }

  async selectUx(navLocation) {
    if (this.selecting) return false

    this.selecting = true

    const { dispatch } = this.props
    const resetSelection = () => {
      this.selecting = false
      this.setState({ loading: false })
    }
    const navigate = (path) => {
      resetSelection()
      dispatch(setMainNavigationPath(path))
      return true
    }

    try {
      this.setState({ loading: true })

      if (typeof navLocation !== "string" || navLocation.length === 0) {
        throw new Error("The saved navigation location is invalid.")
      }

      const { activatedCoins, activeUser, identities } = this.props
      const activeCoinTickers = new Set(Object.keys(activatedCoins || {}))
      const activatedDuringSelection = new Set()
      const startCoins = activeUser.startCoins || {}

      for (const coinObj of Object.values(startCoins)) {
        try {
          let authCheck;
          let authenticated = false;

          if (coinObj.mode !== NATIVE) {
            authCheck = await checkAuthentication(coinObj.mode)
            authenticated = authCheck && authCheck.msg === API_SUCCESS && authCheck.result
          }

          if (coinObj.mode === NATIVE || authenticated) {
            const modeStartupOptions =
              activeUser.startupOptions && activeUser.startupOptions[coinObj.mode]
                ? activeUser.startupOptions[coinObj.mode]
                : {}

            if (await activateCoin(
              coinObj,
              coinObj.mode,
              modeStartupOptions[coinObj.id] != null
                ? modeStartupOptions[coinObj.id]
                : [],
              dispatch
            )) {
              activeCoinTickers.add(coinObj.id)
              activatedDuringSelection.add(coinObj.id)
            }
          }
        } catch (e) {
          dispatch(
            newSnackbar(
              ERROR_SNACK,
              `Unable to activate ${coinObj.id}: ${e.message}`,
              MID_LENGTH_ALERT
            )
          )
        }
      }

      if (navLocation.includes(`${FIX_CHARACTER}${CHAIN_POSTFIX}`)) {
        const coinWalletName = navLocation.split('/').filter(value => {
          return value.includes(`${FIX_CHARACTER}${CHAIN_POSTFIX}`)
        })
        const chainTicker = coinWalletName[0].split(FIX_CHARACTER)[0]

        if (!activeCoinTickers.has(chainTicker)) {
          return navigate(`${POST_AUTH}/${APPS}/${WALLET}`)
        }
      }

      if (navLocation.includes(`${FIX_CHARACTER}${ID_POSTFIX}`)) {
        const pathSegments = navLocation.split('/').filter(value => value.length > 0)
        const identitySegments = pathSegments.filter(value => {
          return value.includes(`${FIX_CHARACTER}${ID_POSTFIX}`)
        })
        const identityLocation =
          identitySegments.length === 1 &&
          pathSegments[pathSegments.length - 1] === identitySegments[0]
            ? parseIdentityNavigationSegment(identitySegments[0])
            : null

        if (identityLocation == null) {
          return navigate(`${POST_AUTH}/${APPS}/${VERUSID}`)
        }

        const { chainTicker, identityIndex } = identityLocation
        const chainIdentities = identities && identities[chainTicker]
        const identityDataLoaded = Array.isArray(chainIdentities)
        const waitingForIdentityRefresh =
          activatedDuringSelection.has(chainTicker) &&
          (!identityDataLoaded || chainIdentities[identityIndex] == null)

        if (
          !waitingForIdentityRefresh &&
          (!identityDataLoaded || chainIdentities[identityIndex] == null)
        ) {
          return navigate(`${POST_AUTH}/${APPS}/${VERUSID}`)
        }
      }

      if (navLocation.includes(`${FIX_CHARACTER}${MINING_POSTFIX}`)) {
        const miningWalletName = navLocation.split('/').filter(value => {
          return value.includes(`${FIX_CHARACTER}${MINING_POSTFIX}`)
        })
        const chainTicker = miningWalletName[0].split(FIX_CHARACTER)[0]

        if (!activeCoinTickers.has(chainTicker)) {
          return navigate(`${POST_AUTH}/${APPS}/${MINING}`)
        }
      }

      if (navLocation.includes(`${FIX_CHARACTER}${PBAAS_POSTFIX}`)) {
        const pbaasChainName = navLocation.split('/').filter(value => {
          return value.includes(`${FIX_CHARACTER}${PBAAS_POSTFIX}`)
        })
        const chainTicker = pbaasChainName[0].split(FIX_CHARACTER)[0]

        if (!activeCoinTickers.has(chainTicker)) {
          return navigate(`${POST_AUTH}/${APPS}/${MULTIVERSE}`)
        }
      }

      return navigate(navLocation)
    } catch (e) {
      dispatch(
        newSnackbar(
          ERROR_SNACK,
          `Unable to restore the saved location: ${e.message}`,
          MID_LENGTH_ALERT
        )
      )
      return navigate(`${POST_AUTH}/${UX_SELECTOR}`)
    } finally {
      if (this.selecting) resetSelection()
    }
  }

  render() {
    return UxSelectorRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    activeUser: state.users.activeUser,
    mainPathArray: state.navigation.mainPathArray,
    activatedCoins: state.coins.activatedCoins,
    identities: state.ledger.identities
  };
};

export default connect(mapStateToProps)(UxSelector);
