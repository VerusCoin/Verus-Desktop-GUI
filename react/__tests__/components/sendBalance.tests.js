import { getSendBalance } from '../../src/components/modals/sendCoin/traditionalSendForm/balanceUtils';

const chainTicker = 'VRSC';
const balances = {
  native: { public: { confirmed: 12.5 } },
  reserve: {},
};

it('uses the aggregate balance instead of dereferencing a missing lite-address balance', () => {
  expect(getSendBalance({
    address: 'RAddress',
    addressMap: { RAddress: { balances: null } },
    balances,
    chainTicker,
    currency: chainTicker,
    useAggregateForMissingAddress: true,
  })).toBe(12.5);
});

it('returns null for a missing native per-address balance', () => {
  expect(getSendBalance({
    address: 'RAddress',
    addressMap: { RAddress: { balances: null } },
    balances,
    chainTicker,
    currency: chainTicker,
  })).toBeNull();
});

it('returns the per-address native balance when it is available', () => {
  expect(getSendBalance({
    address: 'RAddress',
    addressMap: { RAddress: { balances: { native: 4.25, reserve: {} } } },
    balances,
    chainTicker,
    currency: chainTicker,
  })).toBe(4.25);
});

it('returns the aggregate transparent balance for native mode', () => {
  expect(getSendBalance({
    address: null,
    addressMap: {},
    balances,
    chainTicker,
    currency: chainTicker,
  })).toBe(12.5);
});
