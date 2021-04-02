import { saveUsers, loadUsers, registerLogin } from '../../../../util/api/users/userData'
import { encryptKey } from '../../../../util/api/users/pinData'
import {
  SET_USERS,
  LOG_IN,
  LOG_OUT,
  SET_DEFAULT_USER,
  SET_AUTHENTICATION,
  SET_LOGOUT_USER,
  FINISH_LOGOUT_USER,
  SELECT_CURRENCY_FOR_COIN,
} from "../../../../util/constants/storeType";
import { ETH, ELECTRUM, UX_SELECTOR, POST_AUTH, NATIVE } from '../../../../util/constants/componentConstants'
import { makeId } from '../../../../util/idGenerator'
import { setMainNavigationPath } from '../../../actionCreators'

/**
 * Creates a new user object with default values
 */
export const getNewUser = () => {
  return {
    startAtLastLocation: true,
    startLocation: 'post_auth/ux_selector',
    selectedCurrencyMap: {},
    pinFile: null,
    lastNavigationLocation: null,
    name: name,
    id: makeId(),
    lastCoins: {},
    startCoins: {},
    startupOptions: {
      [NATIVE]: {},
      [ELECTRUM]: {},
      [ETH]: {}
    },
    startWithLastCoins: true
  }
}

/**
 * Creates a user object based on parameters, saves it to the users file,
 * and returns an action to be dispatched to the redux store
 * @param {Object} loadedUsers 
 * @param {String} name 
 * @param {String} password (Optional) The password to encrypt the seed
 * @param {String} seed (Optional) The litemode seed for a user
 */
export const createUser = async (loadedUsers, name, password = null, seed = null) => {
  let userObj = getNewUser()
  userObj.pinFile = seed != null && password != null ? await encryptKey(password, seed) : null
  userObj.name = name
  const usersObj = {...loadedUsers, [userObj.id]: userObj}
    
  return await setUsers(usersObj)
}

/**
 * Loads the user object from the user file and returns
 * an action to dispatch to the store
 */
export const initUsers = async () => {
  try {
    let loadedUsers = await loadUsers()

    return await setUsers(loadedUsers)
  } catch (e) {
    throw e
  }
}

/**
 * Sets the encrypted seed for a user, used for setting up lite mode later than account
 * creation
 * @param {Object} loadedUsers The currently loaded users in the redux store
 * @param {String} userId The user id to update
 * @param {String} password The password to encrypt the seed
 * @param {String} seed The litemode seed for the user
 */
export const setUserAuth = async (loadedUsers, userId, password, seed) => {  
  const updates = { pinFile: await encryptKey(password, seed) }

  if (!loadedUsers[userId]) throw new Error(`User with ID ${userId} not found!`)
  
  const usersObj = {...loadedUsers, [userId]: {...loadedUsers[userId], ...updates}}

  return await setUsers(usersObj)
}

/**
 * Returns an action to set a user as the default user
 * @param {String} userId The user id to set as default
 */
export const setDefaultUser = (userId) => {
  return {
    type: SET_DEFAULT_USER,
    userId
  }
}

/**
 * Creates an action to set the users object in the redux store and saves the 
 * user object to a file
 * @param {Object} usersObj A user object to be added 
 */
export const setUsers = async (usersObj) => {
  try {
    await saveUsers(usersObj)
  } catch (e) {
    console.error(e)
    throw e
  }

  return {type: SET_USERS, users: usersObj}
}

/**
 * Returns an array of actions depending on the state of the user object
 * to log in. E.g. LOG_IN, as well as SET_MAIN_NAVIGATION_PATH, if the user
 * has one set as default.
 * @param {Object} userObj The user object to log in
 */
export const loginUser = async (userObj) => {
  await registerLogin(userObj.id)

  return [{type: LOG_IN, userId: userObj.id}, setMainNavigationPath(`${POST_AUTH}/${UX_SELECTOR}`)]
}

/**
 * Returns logout action
 */
export const logout = () => {
  return { type: LOG_OUT }
}

/**
 * Sets the redux "loggingOut" flag to true
 */
export const setLogoutUser = () => {
  return { type: SET_LOGOUT_USER }
}

/**
 * Sets the redux "loggingOut" flag to false
 */
export const finishLogoutUser = () => {
  return { type: FINISH_LOGOUT_USER }
}

/**
 * Sets a users preffered onchain token for a specific 
 * blockchain
 * @param {String} chainTicker The blockchain 
 * @param {String} currency The on-chain token
 */
export const setUserPreferredCurrency = (chainTicker, currency) => {
  return {
    type: SELECT_CURRENCY_FOR_COIN,
    chainTicker,
    currency
  }
}