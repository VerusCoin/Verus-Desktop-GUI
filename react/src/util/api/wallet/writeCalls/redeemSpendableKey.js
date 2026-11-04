import { getApiData } from '../../callCreator'
import { API_REDEEM_SPENDABLE_KEY, NATIVE, POST } from '../../../constants/componentConstants'

/**
 * Opens a gift card link in the login consent window to redeem it to this wallet,
 * resolving once that window is finished
 * @param {String} chainTicker Chain the gift card is on
 * @param {String} uri The gift card link to redeem
 */
export const redeemSpendableKey = async (
  chainTicker,
  uri
) => {
  try {
    return await getApiData(
      NATIVE,
      API_REDEEM_SPENDABLE_KEY,
      {
        chainTicker,
        uri
      },
      POST,
      true
    );
  } catch (e) {
    throw e
  }
};
