import { getApiData } from '../../callCreator'
import {
  API_FUND_SPENDABLE_KEY_PREFLIGHT,
  API_FUND_SPENDABLE_KEY,
  NATIVE,
  POST
} from '../../../constants/componentConstants'

/**
 * Builds or sends the transactions that fund a gift card from this wallet
 * @param {Boolean} preflight If true, nothing will be sent, and the funding plan for the user to confirm will be returned
 * @param {String} chainTicker Chain the gift card is on
 * @param {String} uri The gift card link, used to verify the gift card address
 * @param {String} password (Optional) Claim password needed to unlock the gift card link
 * @param {String} address The gift card address to fund
 * @param {Object[]} funds Currencies to send to the gift card, in { currency, amount } format
 * @param {String[]} identities Addresses of the VerusIDs to move to the gift card
 */
export const fundSpendableKey = async (
  preflight = true,
  chainTicker,
  uri,
  password,
  address,
  funds,
  identities
) => {
  try {
    return await getApiData(
      NATIVE,
      preflight ? API_FUND_SPENDABLE_KEY_PREFLIGHT : API_FUND_SPENDABLE_KEY,
      {
        chainTicker,
        uri,
        password,
        address,
        funds,
        identities
      },
      POST,
      true
    );
  } catch (e) {
    throw e
  }
};
