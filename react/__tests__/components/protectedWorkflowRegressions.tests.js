import '@babel/polyfill';

jest.mock('../../src/components/postAuth/uxSelector/uxSelector.render', () => ({
  UxSelectorRender: jest.fn(),
}));
jest.mock('../../src/components/postAuth/apps/settings/settings.render', () => ({
  SettingsRender: jest.fn(),
  SettingsCardRender: jest.fn(),
  SettingsTabsRender: jest.fn(() => []),
}));
jest.mock('../../src/components/postAuth/apps/mining/mining.render', () => ({
  MiningCardRender: jest.fn(),
  MiningTabsRender: jest.fn(() => []),
}));
jest.mock('../../src/components/postAuth/apps/mining/dashboard/dashboard', () => () => null);
jest.mock('../../src/components/postAuth/apps/mining/miningWallet/miningWallet', () => () => null);
jest.mock('../../src/components/modals/importWallet/importWallet.render', () => ({
  ImportWalletRender: jest.fn(),
}));
jest.mock('../../src/components/modals/bridgekeeper/bridgekeeper.render', () => ({
  BridgekeeperRender: jest.fn(),
}));

jest.mock('../../src/actions/actionCreators', () => ({
  setMainNavigationPath: jest.fn((path) => ({ type: 'NAVIGATE', path })),
  newSnackbar: jest.fn((snackType, message, duration) => ({
    type: 'SNACKBAR',
    snackType,
    message,
    duration,
  })),
  initConfig: jest.fn(),
  initUsers: jest.fn(),
  expireData: jest.fn((chainTicker, updateType) => ({
    type: 'EXPIRE_DATA',
    chainTicker,
    updateType,
  })),
  startLoadingMiningFunctions: jest.fn((chainTicker) => ({
    type: 'START_MINING_ACTION',
    chainTicker,
  })),
  finishLoadingMiningFunctions: jest.fn((chainTicker) => ({
    type: 'FINISH_MINING_ACTION',
    chainTicker,
  })),
}));

jest.mock('../../src/actions/actionDispatchers', () => ({
  activateCoin: jest.fn(),
  activateChainLifecycle: jest.fn(),
  clearAllCoinIntervals: jest.fn(),
  conditionallyUpdateWallet: jest.fn(),
}));

jest.mock('../../src/util/api/coins/coins', () => ({
  initCoin: jest.fn(),
  removeCoin: jest.fn(),
  restartCoin: jest.fn(),
}));
jest.mock('../../src/util/api/settings/configData', () => ({
  saveConfig: jest.fn(),
}));
jest.mock('../../src/util/api/wallet/walletCalls', () => ({
  importWallet: jest.fn(),
  startStaking: jest.fn(),
  stopStaking: jest.fn(),
  startMining: jest.fn(),
  stopMining: jest.fn(),
}));
jest.mock('../../src/util/api/users/userData', () => ({
  checkAuthentication: jest.fn(),
  saveUsers: jest.fn(),
}));
jest.mock('../../src/util/coinData', () => ({
  getCoinColor: jest.fn(),
  getSimpleCoinArray: jest.fn(() => []),
  getCoinObj: jest.fn(),
}));
jest.mock('../../src/store', () => ({
  getState: jest.fn(() => ({})),
}));
jest.mock('../../src/util/api/verusbridge/verusbridge', () => ({
  startBridgekeeperprocess: jest.fn(),
  stopBridgekeeperprocess: jest.fn(),
  bridgekeeperStatus: jest.fn(),
  updateConfFile: jest.fn(),
  getConfFile: jest.fn(),
}));

import {
  activateCoin,
  activateChainLifecycle,
  clearAllCoinIntervals,
  conditionallyUpdateWallet,
} from '../../src/actions/actionDispatchers';
import {
  initConfig,
  initUsers,
  newSnackbar,
} from '../../src/actions/actionCreators';
import { restartCoin } from '../../src/util/api/coins/coins';
import { saveConfig } from '../../src/util/api/settings/configData';
import { saveUsers } from '../../src/util/api/users/userData';
import {
  importWallet as importWalletRequest,
  startStaking,
} from '../../src/util/api/wallet/walletCalls';
import { restartCoinInPlace } from '../../src/actions/actions/coins/dispatchers/coinManager';
import {
  parseIdentityNavigationSegment,
  UxSelector,
} from '../../src/components/postAuth/uxSelector/uxSelector';
import { Settings } from '../../src/components/postAuth/apps/settings/settings';
import { Mining } from '../../src/components/postAuth/apps/mining/mining';
import { ImportWallet } from '../../src/components/modals/importWallet/importWallet';
import { Bridgekeeper } from '../../src/components/modals/bridgekeeper/bridgekeeper';
import {
  getBridgekeeperControlState,
} from '../../src/components/postAuth/apps/mining/miningWallet/miningWallet.render';
import {
  bridgekeeperStatus,
  getConfFile,
  startBridgekeeperprocess,
  stopBridgekeeperprocess,
  updateConfFile,
} from '../../src/util/api/verusbridge/verusbridge';
import {
  API_ERROR,
  NATIVE,
  PRE_DATA,
  POST_AUTH,
  APPS,
  UX_SELECTOR,
  VERUSID,
  WALLET,
} from '../../src/util/constants/componentConstants';

const installSynchronousSetState = (component) => {
  component.setState = (update, callback) => {
    const nextState = typeof update === 'function'
      ? update(component.state, component.props)
      : update;
    component.state = { ...component.state, ...nextState };
    if (callback) callback();
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

it('activates saved coins serially and waits before restoring navigation', async () => {
  const events = [];
  activateCoin.mockImplementation(async (coin) => {
    events.push(`start:${coin.id}`);
    await Promise.resolve();
    events.push(`end:${coin.id}`);
    return true;
  });

  const dispatch = jest.fn((action) => {
    if (action.type === 'NAVIGATE') events.push(`navigate:${action.path}`);
  });
  const component = new UxSelector({
    activatedCoins: {},
    activeUser: {
      startCoins: {
        first: { id: 'VRSC', mode: NATIVE },
        second: { id: 'VRSCTEST', mode: NATIVE },
      },
      startupOptions: { [NATIVE]: {} },
    },
    identities: { VRSC: [] },
    dispatch,
  });
  installSynchronousSetState(component);

  const destination = `${POST_AUTH}/${APPS}/${WALLET}/VRSC|chain`;
  await component.selectUx(destination);

  expect(events).toEqual([
    'start:VRSC',
    'end:VRSC',
    'start:VRSCTEST',
    'end:VRSCTEST',
    `navigate:${destination}`,
  ]);
  expect(component.state.loading).toBe(false);
  expect(component.selecting).toBe(false);
});

it('reports one saved-coin failure and continues activating later coins', async () => {
  activateCoin
    .mockRejectedValueOnce(new Error('Protected operation cancelled.'))
    .mockResolvedValueOnce(true);
  const dispatch = jest.fn();
  const component = new UxSelector({
    activatedCoins: {},
    activeUser: {
      startCoins: {
        first: { id: 'VRSC', mode: NATIVE },
        second: { id: 'VRSCTEST', mode: NATIVE },
      },
      startupOptions: { [NATIVE]: {} },
    },
    identities: { VRSC: [] },
    dispatch,
  });
  installSynchronousSetState(component);

  await component.selectUx(`${POST_AUTH}/${APPS}/${WALLET}`);

  expect(activateCoin).toHaveBeenCalledTimes(2);
  expect(newSnackbar).toHaveBeenCalledWith(
    API_ERROR,
    'Unable to activate VRSC: Protected operation cancelled.',
    expect.anything()
  );
  expect(component.state.loading).toBe(false);
  expect(component.selecting).toBe(false);
});

it('restores a valid identity route while identity data is still refreshing', async () => {
  expect(parseIdentityNavigationSegment('0|VRSC|identity')).toEqual({
    identityIndex: 0,
    chainTicker: 'VRSC',
  });
  activateCoin.mockResolvedValue(true);
  const dispatch = jest.fn();
  const component = new UxSelector({
    activatedCoins: {},
    activeUser: {
      startCoins: { vrsc: { id: 'VRSC', mode: NATIVE } },
      startupOptions: { [NATIVE]: {} },
    },
    identities: { VRSC: [] },
    dispatch,
  });
  installSynchronousSetState(component);
  const destination = `${POST_AUTH}/${APPS}/${VERUSID}/0|VRSC|identity`;

  await expect(component.selectUx(destination)).resolves.toBe(true);

  expect(dispatch).toHaveBeenLastCalledWith({ type: 'NAVIGATE', path: destination });
  expect(component.state.loading).toBe(false);
  expect(component.selecting).toBe(false);
});

it('falls back cleanly for malformed identity routes and navigation exceptions', async () => {
  expect(parseIdentityNavigationSegment('not-an-index|VRSC|identity')).toBeNull();
  const dispatch = jest.fn();
  const component = new UxSelector({
    activatedCoins: { VRSC: {} },
    activeUser: { startCoins: {}, startupOptions: {} },
    identities: {},
    dispatch,
  });
  installSynchronousSetState(component);

  await component.selectUx(
    `${POST_AUTH}/${APPS}/${VERUSID}/not-an-index|VRSC|identity`
  );
  expect(dispatch).toHaveBeenLastCalledWith({
    type: 'NAVIGATE',
    path: `${POST_AUTH}/${APPS}/${VERUSID}`,
  });
  expect(component.state.loading).toBe(false);
  expect(component.selecting).toBe(false);

  await component.selectUx(null);
  expect(dispatch).toHaveBeenLastCalledWith({
    type: 'NAVIGATE',
    path: `${POST_AUTH}/${UX_SELECTOR}`,
  });
  expect(newSnackbar.mock.calls[newSnackbar.mock.calls.length - 1][1]).toContain(
    'saved navigation location is invalid'
  );
  expect(component.state.loading).toBe(false);
  expect(component.selecting).toBe(false);
});

it('keeps coin data and intervals untouched when restart authorization is cancelled', async () => {
  restartCoin.mockResolvedValue({
    msg: API_ERROR,
    result: 'Protected operation cancelled.',
  });
  const dispatch = jest.fn();

  await expect(restartCoinInPlace(
    { id: 'VRSC', options: {} },
    NATIVE,
    [],
    dispatch
  )).rejects.toThrow('Protected operation cancelled.');

  expect(clearAllCoinIntervals).not.toHaveBeenCalled();
  expect(activateChainLifecycle).not.toHaveBeenCalled();
  expect(dispatch).not.toHaveBeenCalled();
});

it('resets stale coin state when restart fails after daemon shutdown begins', async () => {
  restartCoin.mockResolvedValue({
    msg: API_ERROR,
    result: 'daemon status unavailable',
    restartState: {
      stage: 'waiting-for-stop',
      daemonStopInitiated: true,
    },
  });
  const dispatch = jest.fn();

  await expect(restartCoinInPlace(
    { id: 'VRSC', options: {} },
    NATIVE,
    [],
    dispatch
  )).rejects.toThrow('daemon status unavailable');

  expect(clearAllCoinIntervals).toHaveBeenCalledWith('VRSC');
  expect(dispatch).toHaveBeenNthCalledWith(1, {
    type: 'CLEAR_COIN_DATA',
    chainTicker: 'VRSC',
  });
  expect(dispatch).toHaveBeenNthCalledWith(2, {
    type: 'SET_COIN_STATUS',
    chainTicker: 'VRSC',
    status: PRE_DATA,
  });
  expect(activateChainLifecycle).toHaveBeenCalledWith(NATIVE, 'VRSC');
});

it('clears old coin state only after a successful restart', async () => {
  const events = [];
  restartCoin.mockImplementation(async () => {
    events.push('restart');
    return { msg: 'success' };
  });
  clearAllCoinIntervals.mockImplementation(() => events.push('clear-intervals'));
  activateChainLifecycle.mockImplementation(() => events.push('activate-lifecycle'));
  const dispatch = jest.fn(() => events.push('dispatch'));

  await restartCoinInPlace({ id: 'VRSC', options: {} }, NATIVE, [], dispatch);

  expect(events).toEqual([
    'restart',
    'clear-intervals',
    'dispatch',
    'dispatch',
    'activate-lifecycle',
  ]);
});

const createSettingsComponent = ({ config, displayConfig, activeUser, displayUser }) => {
  const component = Object.create(Settings.prototype);
  component.state = { displayConfig, displayUser, loading: false };
  component.props = {
    config,
    activeUser,
    loadedUsers: { [activeUser.id]: activeUser },
    dispatch: jest.fn(),
  };
  installSynchronousSetState(component);
  return component;
};

it('disables the Settings save button while a save is in progress', () => {
  const { SettingsRender } = jest.requireActual(
    '../../src/components/postAuth/apps/settings/settings.render'
  );
  const config = { general: { main: {} } };
  const activeUser = { id: 'user' };
  const view = SettingsRender.call({
    state: {
      displayConfig: { ...config },
      displayUser: { ...activeUser },
      loading: true,
      selectedCoinObj: null,
    },
    props: {
      config,
      activeUser,
      mainPathArray: [],
    },
    coinsWithSettings: [],
    getDisplayConfig: jest.fn(),
    getDisplayUser: jest.fn(),
    updateCoinSelection: jest.fn(),
    saveChanges: jest.fn(),
  });
  const saveButton = view.props.children[0].props.children[0];

  expect(saveButton.props.disabled).toBe(true);
  expect(saveButton.props.children).toBe('Saving...');
});

it('clears Settings loading and surfaces native-authorization cancellation text', async () => {
  const config = {
    general: { main: { requireNativeAuthForIrreversibleActions: true } },
  };
  const displayConfig = {
    general: { main: { requireNativeAuthForIrreversibleActions: false } },
  };
  const activeUser = { id: 'user' };
  const component = createSettingsComponent({
    config,
    displayConfig,
    activeUser,
    displayUser: activeUser,
  });
  saveConfig.mockRejectedValue(new Error('Protected operation cancelled.'));
  initUsers.mockResolvedValue({ type: 'SET_USERS' });
  initConfig.mockResolvedValue([{ type: 'SET_CONFIG' }]);

  await expect(component.saveChanges()).resolves.toBe(false);

  expect(component.state.loading).toBe(false);
  expect(saveUsers).not.toHaveBeenCalled();
  expect(newSnackbar.mock.calls[0][1]).toContain('Protected operation cancelled.');
});

it('explains partial Settings saves and immediate security-setting effect', async () => {
  const config = {
    general: { main: { requireNativeAuthForIrreversibleActions: true } },
  };
  const displayConfig = {
    general: { main: { requireNativeAuthForIrreversibleActions: false } },
  };
  const activeUser = { id: 'user', name: 'Old' };
  const displayUser = { id: 'user', name: 'New' };
  const component = createSettingsComponent({
    config,
    displayConfig,
    activeUser,
    displayUser,
  });
  saveConfig.mockResolvedValue(true);
  saveUsers.mockRejectedValueOnce(new Error('Profile write failed.'));
  initUsers.mockResolvedValue({ type: 'SET_USERS' });
  initConfig.mockResolvedValue([{ type: 'SET_CONFIG' }]);

  await expect(component.saveChanges()).resolves.toBe(false);
  expect(newSnackbar.mock.calls[0][1]).toContain(
    'Configuration was saved, but profile settings were not saved'
  );

  jest.clearAllMocks();
  component.state.displayUser = activeUser;
  component.state.loading = false;
  saveConfig.mockResolvedValue(true);
  initUsers.mockResolvedValue({ type: 'SET_USERS' });
  initConfig.mockResolvedValue([{ type: 'SET_CONFIG' }]);

  await expect(component.saveChanges()).resolves.toBe(true);
  expect(newSnackbar.mock.calls[0][1]).toContain('takes effect immediately');
});

it('surfaces a mining or staking API error without refreshing stale status', async () => {
  startStaking.mockResolvedValue({
    msg: API_ERROR,
    result: 'Protected operation cancelled.',
  });
  const component = Object.create(Mining.prototype);
  component.props = {
    miningInfo: { VRSC: { staking: false } },
    dispatch: jest.fn(),
  };

  await component.toggleStaking('VRSC');

  expect(conditionallyUpdateWallet).not.toHaveBeenCalled();
  expect(newSnackbar).toHaveBeenCalledWith(
    API_ERROR,
    'Protected operation cancelled.',
    expect.anything()
  );
});

it('disables Bridgekeeper until status exists and fails a premature toggle safely', async () => {
  expect(getBridgekeeperControlState(undefined, false)).toEqual({
    disabled: true,
    hasError: false,
    running: false,
    statusAvailable: false,
  });
  expect(getBridgekeeperControlState({
    bridgekeeperstatus: { serverrunning: 0 },
  }, false).disabled).toBe(false);
  expect(getBridgekeeperControlState({
    bridgekeeperstatus: { serverrunning: 1 },
  }, true).disabled).toBe(true);

  const component = Object.create(Mining.prototype);
  component.props = { miningInfo: {}, dispatch: jest.fn() };

  await expect(component.toggleBridging('VRSC')).resolves.toBe(false);

  expect(startBridgekeeperprocess).not.toHaveBeenCalled();
  expect(stopBridgekeeperprocess).not.toHaveBeenCalled();
  expect(conditionallyUpdateWallet).not.toHaveBeenCalled();
  expect(newSnackbar).toHaveBeenCalledWith(
    API_ERROR,
    'Bridgekeeper status is not available yet.',
    expect.anything()
  );
});

it('keeps wallet import selection and modal open after authorization error', async () => {
  importWalletRequest.mockResolvedValue({
    msg: API_ERROR,
    result: 'Protected operation cancelled.',
  });
  const component = Object.create(ImportWallet.prototype);
  component.state = { filename: '/tmp/wallet.dat', loading: false };
  component.props = {
    mode: NATIVE,
    chainTicker: 'VRSC',
    dispatch: jest.fn(),
    setModalLock: jest.fn(),
    closeModal: jest.fn(),
  };
  installSynchronousSetState(component);

  await expect(component.importWallet()).resolves.toBe(false);

  expect(component.state).toEqual({ filename: '/tmp/wallet.dat', loading: false });
  expect(component.props.setModalLock.mock.calls).toEqual([[true], [false]]);
  expect(component.props.closeModal).not.toHaveBeenCalled();
  expect(newSnackbar).toHaveBeenCalledWith(
    API_ERROR,
    'Protected operation cancelled.'
  );
});

const createBridgekeeperComponent = () => {
  const component = Object.create(Bridgekeeper.prototype);
  component.state = {
    loading: false,
    logData: null,
    infuraNode: '',
    bridgeKeeperActive: false,
    bridgeKeeperStatusAvailable: false,
    lastError: null,
  };
  component.props = {
    activeCoin: { id: 'VRSC' },
    setModalLock: jest.fn(),
  };
  installSynchronousSetState(component);
  return component;
};

it('contains Bridgekeeper mount failures and records useful state', async () => {
  getConfFile.mockRejectedValue(new Error('Configuration request failed.'));
  bridgekeeperStatus.mockResolvedValue({
    msg: API_ERROR,
    result: 'Status request failed.',
  });
  const component = createBridgekeeperComponent();

  await expect(component.componentDidMount()).resolves.toBe(false);

  expect(component.state.loading).toBe(false);
  expect(component.state.bridgeKeeperStatusAvailable).toBe(false);
  expect(component.state.logData).toContain('Configuration request failed.');
  expect(component.state.logData).toContain('Status request failed.');
});

it('contains Bridgekeeper status request rejection without an unhandled promise', async () => {
  bridgekeeperStatus.mockRejectedValue(new Error('Bridgekeeper is offline.'));
  const component = createBridgekeeperComponent();

  await expect(component.getBridgekeeperInfo()).resolves.toBe(false);

  expect(component.state.loading).toBe(false);
  expect(component.state.bridgeKeeperStatusAvailable).toBe(false);
  expect(component.state.lastError).toContain('Bridgekeeper is offline.');
  expect(component.state.logData).toContain('Bridgekeeper is offline.');
});

it('surfaces Bridgekeeper configuration authorization cancellation', async () => {
  updateConfFile.mockResolvedValue({
    msg: API_ERROR,
    result: 'Protected operation cancelled.',
  });
  const component = createBridgekeeperComponent();
  component.state.infuraNode = 'wss://example.invalid';

  await expect(component.setConfFile()).resolves.toBe(false);

  expect(component.state.loading).toBe(false);
  expect(component.state.lastError).toContain('Protected operation cancelled.');
  expect(component.state.logData).toContain('Protected operation cancelled.');
  expect(component.props.setModalLock.mock.calls).toEqual([[true], [false]]);
});
