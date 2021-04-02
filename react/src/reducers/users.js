/*
  This reducer stores user data and the active
  user, fetched from the users.json file when the 
  app loads
*/

import { 
  SET_MAIN_NAVIGATION_PATH,
  LOG_IN,
  LOG_OUT,
  SET_USERS,
  SET_USER,
  ACTIVATE_COIN,
  UNTRACK_COIN,
  ENABLE_START_WITH_LAST_COINS,
  ENABLE_START_AT_LAST_LOCATION,
  SET_LOGOUT_USER,
  FINISH_LOGOUT_USER,
  SELECT_CURRENCY_FOR_COIN,
  SET_STARTUP_OPTIONS
} from '../util/constants/storeType'
import {
  ETH,
  ELECTRUM,
  POST_AUTH,
  UX_SELECTOR
} from '../util/constants/componentConstants'

export const users = (state = {
  loadedUsers: {},
  activeUser: null,
  loggedIn: false,
  loggingOut: false,
}, action) => {
  switch (action.type) {
    case SET_USERS: 
      return {
        ...state,
        loadedUsers: action.users,
        activeUser: state.activeUser ? action.users[state.activeUser.id] : null
      };
    case SET_USER: 
      return {
        ...state,
        loadedUsers: {...loadedUsers, [action.userObj.id]: action.userObj}
      }
    case SET_MAIN_NAVIGATION_PATH:
      let _activeUser = state.activeUser && action.navigationPath !== `${POST_AUTH}/${UX_SELECTOR}` ? {
        ...state.activeUser,
        lastNavigationLocation: action.navigationPath,
        startLocation: state.activeUser.startAtLastLocation ? action.navigationPath : state.activeUser.startLocation
      } : state.activeUser

      return {
        ...state,
        activeUser: _activeUser,
        loadedUsers: _activeUser ? { ...state.loadedUsers, [_activeUser.id]: _activeUser } : state.loadedUsers
      };
    case ENABLE_START_AT_LAST_LOCATION:
      _activeUser = {
        ...state.activeUser,
        startAtLastLocation: true,
        startLocation: state.activeUser.lastNavigationLocation
      }

      return {
        ...state,
        activeUser: _activeUser,
        loadedUsers: { ...state.loadedUsers, [_activeUser.id]: _activeUser }
      }
    case SELECT_CURRENCY_FOR_COIN:
      _activeUser = {
        ...state.activeUser,
        selectedCurrencyMap: state.activeUser.selectedCurrencyMap == null ? {
          [action.chainTicker]: action.currency
        } : { ...state.activeUser.selectedCurrencyMap, [action.chainTicker]: action.currency }
      }

      return {
        ...state,
        activeUser: _activeUser,
        loadedUsers: { ...state.loadedUsers, [_activeUser.id]: _activeUser }
      }
    case LOG_IN: 
      return {
        ...state,
        activeUser: state.loadedUsers[action.userId],
        loggedIn: true
      }
    case LOG_OUT:
      return {
        ...state,
        activeUser: null,
        loggedIn: false,
        authenticated: {
          [ETH]: false,
          [ELECTRUM]: false
        }
      }
    case ACTIVATE_COIN: 
      const lastCoins = { ...state.activeUser.lastCoins, [action.chainTicker]: action.activatedCoin }
      _activeUser = {
        ...state.activeUser,
        lastCoins: lastCoins
      };

      if (_activeUser.startWithLastCoins) {
        _activeUser.startCoins = lastCoins
      }
      
      return {
        ...state,
        activeUser: _activeUser,
        loadedUsers: { ...state.loadedUsers, [_activeUser.id]: _activeUser }
      }
    case UNTRACK_COIN: 
      let newLastCoins = { ...state.activeUser.lastCoins }
      delete newLastCoins[action.chainTicker]
      _activeUser = { ...state.activeUser, lastCoins: newLastCoins }

      if (_activeUser.startWithLastCoins) {
        _activeUser.startCoins = newLastCoins
      }

      return {
        ...state,
        activeUser: _activeUser,
        loadedUsers: { ...state.loadedUsers, [_activeUser.id]: _activeUser }
      }
    case ENABLE_START_WITH_LAST_COINS:
      return {
        ...state,
        activeUser: {
          ...state.activeUser,
          startWithLastCoins: true,
          startCoins: state.activeUser.lastCoins
        }
      }
    case SET_STARTUP_OPTIONS:
      return {
        ...state,
        activeUser: {
          ...state.activeUser,
          startupOptions: {
            ...state.activeUser.startupOptions,
            [action.mode]: {
              ...state.activeUser.startupOptions[action.mode],
              [action.chainTicker]: action.startupOptions
            }
          }
        }
      }
    case SET_LOGOUT_USER: 
      return {
        ...state,
        loggingOut: true
      }
    case FINISH_LOGOUT_USER: 
      return {
        ...state,
        loggingOut: false
      }
    default:
      return state;
  }
}