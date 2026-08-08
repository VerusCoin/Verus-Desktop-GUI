export const getSendBalance = ({
  address,
  addressMap,
  balances,
  chainTicker,
  currency,
  useAggregateForMissingAddress = false,
}) => {
  const selectedCurrency = currency == null ? chainTicker : currency;

  const getAggregateBalance = () => {
    if (balances == null) return null;

    if (selectedCurrency === chainTicker) {
      const nativePublic = balances.native && balances.native.public;
      return nativePublic && nativePublic.confirmed != null
        ? nativePublic.confirmed
        : null;
    }

    const reserveBalance = balances.reserve && balances.reserve[selectedCurrency];
    return reserveBalance && reserveBalance.public
      ? reserveBalance.public.confirmed
      : 0;
  };

  if (address == null) return getAggregateBalance();

  const addressEntry = addressMap && addressMap[address];
  const addressBalances = addressEntry && addressEntry.balances;
  if (addressBalances == null) {
    return useAggregateForMissingAddress ? getAggregateBalance() : null;
  }

  if (selectedCurrency === chainTicker) {
    return addressBalances.native != null ? addressBalances.native : null;
  }

  return addressBalances.reserve && addressBalances.reserve[selectedCurrency] != null
    ? addressBalances.reserve[selectedCurrency]
    : 0;
};
