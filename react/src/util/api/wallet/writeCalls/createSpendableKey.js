import { getApiData } from '../../callCreator'
import { API_CREATE_SPENDABLE_KEY, NATIVE, POST } from '../../../constants/componentConstants'

/**
 * Creates a gift card (spendable key) and returns its link, address and whether it is password protected
 * @param {String} chainTicker Chain to create the gift card for
 * @param {String} password (Optional) Claim password needed to unlock the gift card
 */
export const createSpendableKey = async (
  chainTicker,
  password
) => {
  try {
    return await getApiData(
      NATIVE,
      API_CREATE_SPENDABLE_KEY,
      {
        chainTicker,
        password
      },
      POST,
      true
    );
  } catch (e) {
    throw e
  }
};
