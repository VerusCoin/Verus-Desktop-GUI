import Store from '../../../../store'
import { setGiftCard, removeGiftCard } from '../creators/users'
import { saveUsers } from '../../../../util/api/users/userData'

/**
 * Returns the gift card saved on the active user
 * @param {String} address The address of the gift card
 */
export const getSavedGiftCard = (address) => {
  return (Store.getState().users.activeUser.giftCards || {})[address]
}

/**
 * Saves a gift card to the active user and writes the user file,
 * returning the saved gift card
 * @param {Object} giftCard The gift card to save
 */
export const saveGiftCard = async (giftCard) => {
  Store.dispatch(setGiftCard(giftCard))
  await saveUsers(Store.getState().users.loadedUsers)

  return getSavedGiftCard(giftCard.address)
}

/**
 * Saves a gift card only if the saved one is still the one it was made from,
 * returning the gift card that is saved afterwards
 * @param {Object} expectedCard The saved gift card the update was made from
 * @param {Object} giftCard The updated gift card
 */
export const saveGiftCardIfUnchanged = async (expectedCard, giftCard) => {
  const currentCard = getSavedGiftCard(giftCard.address)

  if (currentCard !== expectedCard) return currentCard

  return await saveGiftCard(giftCard)
}

/**
 * Removes a gift card only if the saved one is still the one that was checked,
 * returning whether it was removed
 * @param {Object} expectedCard The saved gift card the delete checks ran on
 */
export const removeGiftCardIfUnchanged = async (expectedCard) => {
  if (getSavedGiftCard(expectedCard.address) !== expectedCard) return false

  Store.dispatch(removeGiftCard(expectedCard.address))
  await saveUsers(Store.getState().users.loadedUsers)

  return true
}
