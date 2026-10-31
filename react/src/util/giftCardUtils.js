import {
  API_SUCCESS,
  GIFT_CARD_FUNDING_STATUS_PENDING,
  GIFT_CARD_FUNDING_STATUS_CONFIRMED
} from './constants/componentConstants'
import { discoverSpendableKeyClaims, getTransaction } from './api/wallet/walletCalls'

export const normalizeCardLabel = (label) => {
  const normalized = typeof label === 'string' ? label.trim() : ''

  return normalized.length > 0 ? normalized : 'Gift Card'
}

/**
 * Creates a new gift card object from a created spendable key
 * @param {String} chainTicker Chain the gift card is on
 * @param {String} label Label the user gave the gift card
 * @param {Object} createResult The created spendable key, in { uri, address, encrypted } format
 */
export const getNewGiftCard = (chainTicker, label, createResult) => {
  const { uri, address, encrypted } = createResult

  return {
    address,
    label: normalizeCardLabel(label),
    chainTicker,
    encrypted: encrypted === true,
    uri,
    createdAt: Date.now(),
    sharedAt: null,
    status: {
      currencies: [],
      identities: [],
      redeemed: false,
      claimInfo: null,
      identityLookupError: null,
      hasMempoolTransactions: false,
      lastCheckedAt: null
    },
    fundingHistory: []
  }
}

export const hasGiftCardClaims = (giftCard) => {
  const status = giftCard != null ? giftCard.status : null

  return (
    status != null &&
    ((status.currencies || []).length > 0 || (status.identities || []).length > 0)
  )
}

export const hasGiftCardBeenRedeemed = (giftCard) => {
  return giftCard != null && giftCard.status != null && giftCard.status.redeemed === true
}

export const getGiftCardClaimInfo = (giftCard) => {
  return hasGiftCardBeenRedeemed(giftCard) ? giftCard.status.claimInfo || null : null
}

export const truncateAddress = (address) => {
  if (!address || address.length <= 22) return address || ''

  return `${address.slice(0, 10)}...${address.slice(-8)}`
}

export const getClaimedByLabel = (claimInfo) => {
  const addresses = (claimInfo && claimInfo.claimedByAddresses) || []

  if (addresses.length === 0) return 'recipient unavailable'
  if (addresses.length === 1) return truncateAddress(addresses[0])

  return `${truncateAddress(addresses[0])} +${addresses.length - 1} more`
}

export const getGiftCardPendingFundings = (giftCard) => {
  return ((giftCard && giftCard.fundingHistory) || []).filter(
    entry => entry.status === GIFT_CARD_FUNDING_STATUS_PENDING
  )
}

export const hasPendingGiftCardFunding = (giftCard) => {
  return getGiftCardPendingFundings(giftCard).length > 0
}

export const hasGiftCardBeenShared = (giftCard) => {
  return giftCard != null && Number(giftCard.sharedAt) > 0
}

// A shared gift card is single-use, so it can only be funded once
export const canStartGiftCardFunding = (giftCard) => {
  if (hasGiftCardBeenRedeemed(giftCard)) return false
  if (!hasGiftCardBeenShared(giftCard)) return true

  return !hasGiftCardClaims(giftCard) && (giftCard.fundingHistory || []).length === 0
}

export const markGiftCardShared = (giftCard, sharedAt = Date.now()) => {
  return hasGiftCardBeenShared(giftCard) ? giftCard : { ...giftCard, sharedAt }
}

export const hasGiftCardIdentityLookupError = (giftCard) => {
  const status = giftCard != null ? giftCard.status : null

  return (
    status != null &&
    typeof status.identityLookupError === 'string' &&
    status.identityLookupError.length > 0
  )
}

export const hasGiftCardMempoolTransactions = (giftCard) => {
  return giftCard != null && giftCard.status != null && giftCard.status.hasMempoolTransactions === true
}

export const canDeleteGiftCard = (giftCard) => {
  return (
    giftCard != null &&
    giftCard.status != null &&
    !hasPendingGiftCardFunding(giftCard) &&
    !hasGiftCardClaims(giftCard) &&
    !hasGiftCardIdentityLookupError(giftCard)
  )
}

export const getStatusLabel = (giftCard) => {
  if (hasGiftCardBeenRedeemed(giftCard)) return 'Redeemed'
  if (hasPendingGiftCardFunding(giftCard)) return 'Pending funding'
  if (hasGiftCardClaims(giftCard)) return 'Funded'
  return 'Created'
}

export const needsUnfundedShareWarning = (giftCard) => {
  return giftCard != null && !hasGiftCardClaims(giftCard) && !hasGiftCardBeenRedeemed(giftCard)
}

// Mobile's getExpectedFundingIdentities: IDs seen on the card, claimed from it, or moved to it by a
// confirmed funding. A VerusID on a card leaves nothing at the card's address, so Desktop looks
// these up directly.
export const getExpectedFundingIdentities = (giftCard) => {
  const status = giftCard.status || {}
  const confirmedFundings = (giftCard.fundingHistory || []).filter(
    entry => entry.status === GIFT_CARD_FUNDING_STATUS_CONFIRMED
  )

  return [
    ...new Set([
      ...(status.identities || []).map(identity => identity.identityAddress),
      ...((status.claimInfo && status.claimInfo.identities) || []),
      ...confirmedFundings.flatMap(entry => (entry.identities || []).map(identity => identity.identityAddress))
    ])
  ].filter(identityAddress => typeof identityAddress === 'string' && identityAddress.length > 0)
}

// Leaves out the check time, so a refresh only counts as a change if the card's contents changed
export const getRefreshComparableCard = (giftCard) => {
  return JSON.stringify({
    fundingHistory: giftCard.fundingHistory || [],
    status: giftCard.status ? { ...giftCard.status, lastCheckedAt: null } : null
  })
}

/**
 * Records the transactions sent to fund a gift card as pending
 * @param {Object} giftCard The funded gift card
 * @param {Object} fundingResult The funding result, in { results: [{ type, txid, identity }] } format
 */
export const addGiftCardPendingFunding = (giftCard, fundingResult) => {
  const transactions = (fundingResult.results || []).filter(
    transaction => typeof transaction.txid === 'string' && transaction.txid.length > 0
  )

  if (transactions.length === 0) return giftCard

  return {
    ...giftCard,
    fundingHistory: [
      ...(giftCard.fundingHistory || []),
      {
        createdAt: Date.now(),
        status: GIFT_CARD_FUNDING_STATUS_PENDING,
        txids: transactions.map(transaction => transaction.txid),
        identities: transactions
          .filter(transaction => transaction.type === 'identity' && transaction.identity != null)
          .map(transaction => transaction.identity)
      }
    ]
  }
}

const fundingTransactionIsConfirmed = async (chainTicker, txid) => {
  try {
    const transactionRes = await getTransaction(chainTicker, txid)

    return (
      transactionRes.msg === API_SUCCESS &&
      Number(transactionRes.result.confirmations || 0) > 0
    )
  } catch (e) {
    return false
  }
}

const resolveFundingHistory = async (chainTicker, fundingHistory) => {
  return Promise.all((fundingHistory || []).map(async entry => {
    if (entry.status !== GIFT_CARD_FUNDING_STATUS_PENDING) return entry

    const confirmations = await Promise.all(
      (entry.txids || []).map(txid => fundingTransactionIsConfirmed(chainTicker, txid))
    )

    return confirmations.every(Boolean)
      ? { ...entry, status: GIFT_CARD_FUNDING_STATUS_CONFIRMED, confirmedAt: Date.now() }
      : entry
  }))
}

/**
 * Checks what a gift card holds and whether its pending funding has confirmed
 * @param {Object} giftCard The gift card to refresh
 */
export const refreshGiftCardStatus = async (giftCard) => {
  const fundingHistory = await resolveFundingHistory(giftCard.chainTicker, giftCard.fundingHistory)
  const claimsRes = await discoverSpendableKeyClaims(
    giftCard.chainTicker,
    giftCard.address,
    getExpectedFundingIdentities({ ...giftCard, fundingHistory })
  )

  if (claimsRes.msg !== API_SUCCESS) throw new Error(claimsRes.result)

  const {
    currencies,
    identities,
    redeemed,
    claimInfo,
    identityLookupError,
    hasMempoolTransactions
  } = claimsRes.result

  return {
    ...giftCard,
    status: {
      currencies: currencies || [],
      identities: identities || [],
      redeemed: redeemed === true,
      claimInfo: claimInfo || null,
      identityLookupError: identityLookupError || null,
      hasMempoolTransactions: hasMempoolTransactions === true,
      lastCheckedAt: Date.now()
    },
    fundingHistory
  }
}
