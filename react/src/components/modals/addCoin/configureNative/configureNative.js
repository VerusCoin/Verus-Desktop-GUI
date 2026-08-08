import React from 'react';
import { connect } from 'react-redux';
import { 
  ConfigureNativeRender
} from './configureNative.render';
import io from 'socket.io-client';
import { checkZcashParamsFormatted, downloadZcashParams } from '../../../../util/api/setup/zcashParams'
import {
  ZCPARAMS_SOCKET,
  ADDCOIN_DELAY,
  ERROR_SNACK,
  SUCCESS_SNACK,
  MID_LENGTH_ALERT,
  ADD_COIN,
  SELECT_COIN,
  NATIVE,
} from "../../../../util/constants/componentConstants";
import { addCoin } from '../../../../actions/actionDispatchers'
import { newSnackbar, setModalNavigationPath } from '../../../../actions/actionCreators'

export class ConfigureNative extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      done: false,
      updateProgressBar: {
        proving: -1,
        verifying: -1,
        output: -1,
        spend: -1,
        groth16: -1,
      },
      overallProgress: 0,
      passThrough: false,

      //DEPRECATED, TODO: DELETE
      error: false,
    };

    this.socket = io(
      `http://127.0.0.1:${this.props.config.general.main.agamaPort}`,
      { transports: ['websocket'] }
    );
    this.waitForSocketConnection = this.waitForSocketConnection.bind(this)
    this.initZcashParamsDl = this.initZcashParamsDl.bind(this)
    this.updateSocketsData = this.updateSocketsData.bind(this)
    this.calculateProgress = this.calculateProgress.bind(this)
    this.canPassthrough = this.canPassthrough.bind(this)
    this.addCoin = this.addCoin.bind(this)
    this._handleError = this._handleError.bind(this)
  }

  async componentDidMount() {
    this.props.setModalLock(true)
    this.socket.on(ZCPARAMS_SOCKET, msg => this.updateSocketsData(msg));

    if (await this.canPassthrough()) {
      this.setState({ overallProgress: 100, passThrough: true })
      this.addCoin()
    } else {
      try {
        await this.waitForSocketConnection()
        this.initZcashParamsDl()
      } catch (e) {
        this._handleError(e.message)
      }
    }
  }

  componentWillUnmount() {
    this.socket.removeAllListeners(ZCPARAMS_SOCKET);
    this.socket.close();
    this.props.setModalLock(false)
  }

  waitForSocketConnection() {
    if (this.socket.connected) return Promise.resolve()

    return new Promise((resolve, reject) => {
      let lastError
      const cleanup = () => {
        clearTimeout(timeout)
        this.socket.off('connect', handleConnect)
        this.socket.off('connect_error', handleConnectError)
      }
      const handleConnect = () => {
        cleanup()
        resolve()
      }
      const handleConnectError = error => {
        lastError = error
      }
      const timeout = setTimeout(() => {
        cleanup()
        reject(lastError || new Error('Unable to connect to the download progress service'))
      }, 10000)

      this.socket.on('connect', handleConnect)
      this.socket.on('connect_error', handleConnectError)
    })
  }

  calculateProgress() {
    const { updateProgressBar } = this.state
    let overallProgress = 0
    
    for (let key in updateProgressBar) {
      if (updateProgressBar[key] > -1) {
        overallProgress += updateProgressBar[key] / Object.keys(updateProgressBar).length
      }
    }

    this.setState({ overallProgress })
  }

  async canPassthrough() {
    const zcashParamsErrors = await checkZcashParamsFormatted()

    if (zcashParamsErrors.msg === 'success') {
      const zcpmsRes = zcashParamsErrors.result
      
      if (zcpmsRes.length > 0) {
        return false
      } else {
        return true
      }
    } else {
      this.setState({ error: zcashParamsErrors.result })
      return false
    }
  }

  initZcashParamsDl() {
    this.setState({
      updateProgressBar: {
        proving: 0,
        verifying: 0,
        output: 0,
        spend: 0,
        groth16: 0,
      },
      done: false,
    })

    downloadZcashParams(this.props.config.general.native.zcashParamsSrc)
    .then(res => {
      if (res.msg === 'success') {
        this.props.dispatch(newSnackbar(SUCCESS_SNACK, "ZCash parameter download started!", MID_LENGTH_ALERT))
      } else {
        this.props.dispatch(newSnackbar(ERROR_SNACK, res.result))
      }
    })
  }

  _handleError(message) {
    this.props.dispatch(newSnackbar(ERROR_SNACK, message));
    this.props.dispatch(setModalNavigationPath(`${ADD_COIN}/${SELECT_COIN}`))
  }

  async addCoin() {
    const { addCoinParams, activatedCoins, startupOptions } = this.props

    try {
      let startParams = []

      if (addCoinParams.mode === NATIVE) {
        startParams = [
          ...(addCoinParams.startParams == null
            ? []
            : addCoinParams.startParams),
          ...(startupOptions != null &&
          startupOptions[NATIVE][addCoinParams.coinObj.id] != null
            ? startupOptions[NATIVE][addCoinParams.coinObj.id]
            : []),
        ];
      }

      const result = await addCoin(
        addCoinParams.coinObj,
        addCoinParams.mode,
        this.props.dispatch,
        Object.keys(activatedCoins),
        startParams
      );

      if (result.msg === "error") {
        this._handleError(result.result)
      } else {
        this.setState({ done: true }, () => {
          setTimeout(() => {
            this.props.dispatch(
              newSnackbar(
                SUCCESS_SNACK,
                `${addCoinParams.coinObj.id} added in native mode!`,
                MID_LENGTH_ALERT
              )
            );
            this.props.closeModal();
          }, ADDCOIN_DELAY);
        });
      }
    } catch (e) {
      this._handleError(e.message)
    }
  }

  updateSocketsData(data) {
    if (data &&
        data.msg &&
        data.msg.type === 'zcpdownload') {
      const _msg = data.msg;

      if ((_msg.status === 'progress' || _msg.status === 'done') && _msg.file !== 'all') {
        if (!Number.isFinite(_msg.progress)) return

        this.setState(prevState => ({
          updateProgressBar: {
            ...prevState.updateProgressBar,
            [_msg.file]: _msg.progress
          }
        }), this.calculateProgress)
      } else if (_msg.status === 'done' && _msg.file === 'all') {
        this.setState({ overallProgress: 100 }, () => {
          this.addCoin()
        })
      } else if (_msg.status === 'error') {
        this.setState({ done: true, overallProgress: 0, error: _msg.message })
      }
    }
  }

  render() {
    return ConfigureNativeRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    mainPath: state.navigation.mainPath,
    config: state.settings.config,
    activatedCoins: state.coins.activatedCoins,
    startupOptions: state.users.activeUser.startupOptions
  };
};

export default connect(mapStateToProps)(ConfigureNative);
