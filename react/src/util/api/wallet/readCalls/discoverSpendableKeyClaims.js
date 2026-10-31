import { getApiData } from '../../callCreator'
import { API_DISCOVER_SPENDABLE_KEY_CLAIMS, NATIVE, POST } from '../../../constants/componentConstants'

/**
 * Finds the funds and VerusIDs a gift card (spendable key) address holds, before claim fees
 * @param {String} chainTicker Chain the gift card is on
 * @param {String} address Gift card address to check
 * @param {String[]} expectedIdentities Addresses of the VerusIDs the gift card is known to have held
 */
export const discoverSpendableKeyClaims = async (
  chainTicker,
  address,
  expectedIdentities = []
) => {
  try {
    return await getApiData(
      NATIVE,
      API_DISCOVER_SPENDABLE_KEY_CLAIMS,
      {
        chainTicker,
        address,
        subtractDisplayFees: false,
        expectedIdentities
      },
      POST
    );
  } catch (e) {
    throw e
  }
};
