import React from 'react';
import { connect } from 'react-redux';
import { 
  ConfigureLiteRender
} from './configureLite.render';
import { setModalNavigationPath } from '../../../../actions/actionCreators'
import { SETUP, LOGIN, SUCCESS_SNACK, MID_LENGTH_ALERT, ERROR_SNACK, ADD_COIN, SELECT_COIN, API_SUCCESS } from '../../../../util/constants/componentConstants'
import { addCoin } from '../../../../actions/actionDispatchers'
import { newSnackbar } from '../../../../actions/actionCreators'
import { authenticateSeed, checkAuthentication } from '../../../../util/api/users/userData';

class ConfigureLite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seed: null,
      password: null,
      loading: false,
      
      //DEPRECATED, TODO: DELETE
      error: false,
    }

    this.getSeed = this.getSeed.bind(this)
    this.getPassword = this.getPassword.bind(this)
    this.activateCoin = this.activateCoin.bind(this)
    this._handleError = this._handleError.bind(this)
  }

  async componentDidMount() {
    const authCheck = await checkAuthentication(this.props.addCoinParams.mode)

    if (authCheck.msg === API_SUCCESS && authCheck.result) {
      this.activateCoin(true)
    } else {
      let navigationAction
      if (this.props.activeUser.pinFile) {
        navigationAction = setModalNavigationPath(this.props.modalPathArray.join('/') + '/' + LOGIN)
      } else {
        navigationAction = setModalNavigationPath(this.props.modalPathArray.join('/') + '/' + SETUP)
      }

      this.props.dispatch(navigationAction)
    }
  }

  getSeed(seed, callback) {
    this.setState({ seed }, () => { if (callback) callback()})
  }

  getPassword(password, callback) {
    this.setState({password}, () => { if (callback) callback()})
  }

  _handleError(message) {
    this.props.dispatch(newSnackbar(ERROR_SNACK, message))
    this.props.dispatch(setModalNavigationPath(`${ADD_COIN}/${SELECT_COIN}`))
  }

  activateCoin(checkedAuth = false) {
    this.props.setModalLock(true)

    this.setState({ loading: true }, async () => {
      const { addCoinParams, activatedCoins } = this.props
      const { seed } = this.state

      try {
        if (!checkedAuth) {
          const authCheck = await checkAuthentication(addCoinParams.mode)
          const authenticated = authCheck.msg === API_SUCCESS && authCheck.result
          if (!authenticated) await authenticateSeed(seed)
        }
  
        const result = await addCoin(
          addCoinParams.coinObj,
          addCoinParams.mode,
          this.props.dispatch,
          Object.keys(activatedCoins)
        );

        this.props.setModalLock(false)
  
        if (result.msg === 'error') {
          this._handleError(result.result)
        } else {
          this.props.dispatch(
            newSnackbar(
              SUCCESS_SNACK,
              `${addCoinParams.coinObj.id} activated in lite mode${
                addCoinParams.startParams &&
                addCoinParams.startParams.indexOf("-nspv") > -1
                  ? " (nspv)"
                  : ""
              }!`,
              MID_LENGTH_ALERT
            )
          );
          this.props.closeModal()
        }
      } catch (e) {
        this.props.setModalLock(false)
        this._handleError(e.message)
      }
    })
  }

  render() {
    return ConfigureLiteRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    activeUser: state.users.activeUser,
    activatedCoins: state.coins.activatedCoins
  };
};

export default connect(mapStateToProps)(ConfigureLite);