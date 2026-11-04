import { getApiData } from '../../callCreator'
import { API_GET_TRANSACTION, NATIVE, POST } from '../../../constants/componentConstants'

/**
 * Function to get one wallet transaction, including its confirmations (native only)
 * @param {String} chainTicker Ticker symbol for the chain of the transaction
 * @param {String} txid The id of the transaction to get
 */
export const getTransaction = async (chainTicker, txid) => {
  const params = {chainTicker, txid}

  try {
    return await getApiData(NATIVE, API_GET_TRANSACTION, params, POST)
  } catch (e) {
    throw e
  }
}
