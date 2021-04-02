import { apiGet, apiPost, getApiData } from '../callCreator'
import { LOAD_USERS, RESET_USERS, SAVE_USERS, AUTHENTICATE, ETH, ELECTRUM, POST, LOG_OUT, BACKUP_USERS, API_LOGOUT_USER, API_LOGIN_USER, CHECK_AUTHENTICATION } from '../../constants/componentConstants'

/**
 * Loads the users object from the user file, if no file is present,
 * a new one with an empty users object is created and an empty object is returned
 */
export const loadUsers = async () => {
  try {
    const res = await apiGet(LOAD_USERS, true)
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}

/**
 * Saves a users object to the user file
 * @param {Object} userObj 
 */
export const saveUsers = async (userObj) => {
  try {
    const res = await apiPost(SAVE_USERS, {userObj}, true)
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e)
    throw new Error(e.message)
  }
}

/**
 * Backs up the existing user file
 */
export const backupUsers = async () => {
  try {
    const res = await apiPost(BACKUP_USERS, {})
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}

/**
 * Resets the user file to an empty object
 */
export const resetUsers = async () => {
  try {
    const res = await apiPost(RESET_USERS)
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}

/**
 * Authenticates a seed for eth and electrum modes. Returns true on success, throws
 * error on failiure
 * @param {String} seed Seed to authenticate with
 */
export const authenticateSeed = async (seed) => {
  try {
    const electrumAuthResult = await getApiData(ELECTRUM, AUTHENTICATE, {seed}, POST, true)
    const ethAuthResult = await getApiData(ETH, AUTHENTICATE, {seed}, POST, true)

    if (electrumAuthResult.msg === 'error') throw new Error("Electrum authentication failed.")
    else if (ethAuthResult.msg === 'error') throw new Error("Eth authentication failed.")

    return true
  } catch (e) {
    console.error(e.message)
    throw e
  }
}

/**
 * Checks if a coin is authenticated
 * @param {String} chainTicker Coin to check
 */
export const checkAuthentication = async (mode) => {
  try {
    return await getApiData(mode, CHECK_AUTHENTICATION)
  } catch (e) {
    console.error(e.message)
    throw e
  }
}

/**
 * Un-authenticates a user in eth and electrum
 */
export const logoutUser = async () => {
  try {
    const electrumLogoutResult = await getApiData(ELECTRUM, LOG_OUT, {}, POST)
    const ethLogoutResult = await getApiData(ETH, LOG_OUT, {}, POST)
    await apiPost(API_LOGOUT_USER)

    if (electrumLogoutResult.msg === 'error') throw new Error("Electrum logout failed.")
    else if (ethLogoutResult.msg === 'error') throw new Error("Eth logout failed.")

    return true
  } catch (e) {
    console.error(e.message)
    throw e
  }
}

/**
 * Un-authenticates a user in eth and electrum
 */
export const registerLogin = async (id) => {
  try {
    await apiPost(API_LOGIN_USER, { id })

    return true
  } catch (e) {
    console.error(e.message)
    throw e
  }
}
