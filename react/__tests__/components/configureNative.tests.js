import '@babel/polyfill';
import io from 'socket.io-client';
import { ConfigureNative } from '../../src/components/modals/addCoin/configureNative/configureNative';

jest.mock('socket.io-client', () => jest.fn());
jest.mock('../../src/components/modals/addCoin/configureNative/configureNative.render', () => ({
  ConfigureNativeRender: jest.fn(),
}));
jest.mock('../../src/util/api/setup/zcashParams', () => ({
  checkZcashParamsFormatted: jest.fn(),
  downloadZcashParams: jest.fn(),
}));
jest.mock('../../src/actions/actionDispatchers', () => ({ addCoin: jest.fn() }));
jest.mock('../../src/actions/actionCreators', () => ({
  newSnackbar: jest.fn(),
  setModalNavigationPath: jest.fn(),
}));

const createSocket = () => {
  const handlers = {};
  const socket = {
    connected: false,
    on: jest.fn((event, handler) => {
      handlers[event] = handler;
    }),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    close: jest.fn(),
  };

  return { handlers, socket };
};

const createComponent = (socket) => {
  io.mockReturnValue(socket);
  const props = {
    config: {
      general: {
        main: { agamaPort: 17775 },
        native: { zcashParamsSrc: 'verus.io' },
      },
    },
    setModalLock: jest.fn(),
    dispatch: jest.fn(),
  };
  const component = new ConfigureNative(props);

  component.setState = (update, callback) => {
    const nextState = typeof update === 'function'
      ? update(component.state, component.props)
      : update;
    component.state = { ...component.state, ...nextState };
    if (callback) callback();
  };

  return component;
};

beforeEach(() => {
  io.mockReset();
});

it('uses WebSocket transport so strict Origin validation can remain enabled', () => {
  const { socket } = createSocket();

  createComponent(socket);

  expect(io).toHaveBeenCalledWith(
    'http://127.0.0.1:17775',
    { transports: ['websocket'] }
  );
});

it('updates overall progress when a file progress event arrives', () => {
  const { socket } = createSocket();
  const component = createComponent(socket);
  component.state.updateProgressBar = {
    proving: 0,
    verifying: 0,
    output: 0,
    spend: 0,
    groth16: 0,
  };

  component.updateSocketsData({
    msg: {
      type: 'zcpdownload',
      status: 'progress',
      file: 'spend',
      progress: 50,
    },
  });

  expect(component.state.updateProgressBar.spend).toBe(50);
  expect(component.state.overallProgress).toBe(10);
});

it('does not start downloading until the progress socket is connected', async () => {
  const { handlers, socket } = createSocket();
  const component = createComponent(socket);
  component.canPassthrough = jest.fn().mockResolvedValue(false);
  component.initZcashParamsDl = jest.fn();

  const mounting = component.componentDidMount();
  await new Promise(resolve => setImmediate(resolve));

  expect(component.initZcashParamsDl).not.toHaveBeenCalled();
  expect(typeof handlers.connect).toBe('function');

  socket.connected = true;
  handlers.connect();
  await mounting;

  expect(component.initZcashParamsDl).toHaveBeenCalledTimes(1);
});
