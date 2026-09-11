import React from 'react';
import { connect } from 'react-redux';
import { 
  SettingsRender,
  SettingsCardRender,
  SettingsTabsRender
} from './settings.render';
import {
  GENERAL_SETTINGS,
  PROFILE_SETTINGS,
  COIN_SETTINGS,
  SUCCESS_SNACK,
  ERROR_SNACK,
  MID_LENGTH_ALERT,
  NATIVE
} from "../../../../util/constants/componentConstants";
import { setMainNavigationPath, initConfig, initUsers, newSnackbar } from '../../../../actions/actionCreators';
import { getPathParent } from '../../../../util/navigationUtils';
import { saveConfig } from '../../../../util/api/settings/configData';
import { saveUsers } from '../../../../util/api/users/userData';
import { getSimpleCoinArray, getCoinObj } from '../../../../util/coinData';

//TODO: Re-add coin settings when needed
const SETTINGS_TYPES = [PROFILE_SETTINGS, GENERAL_SETTINGS, COIN_SETTINGS]

const nativeAuthorizationSetting = (config) =>
  config && config.general && config.general.main
    ? config.general.main.requireNativeAuthForIrreversibleActions
    : undefined

const errorMessage = (error) =>
  error && error.message ? error.message : String(error)

const errorSentence = (error) => {
  const message = errorMessage(error)
  return /[.!?]$/.test(message) ? message : `${message}.`
}

export class Settings extends React.Component {
  constructor(props) {
    super(props);
    const activeNativeCoinArray = Object.values(props.activeCoins).filter(coin => coin.mode === NATIVE)  
    const inactiveNativeCoinArray = getSimpleCoinArray().reduce(function(result, simpleCoinObj) {
      const coinObj = getCoinObj(simpleCoinObj.id)

      // Currently there are only coin specific settings for native
      if (
        coinObj.available_modes[NATIVE] &&
        !activeNativeCoinArray.some(
          (activeCoin) => activeCoin.id === coinObj.id
        )
      ) {
        result.push(coinObj);
      }

      return result;
    }, []);
    
    this.coinsWithSettings = [...activeNativeCoinArray, ...inactiveNativeCoinArray]

    this.state = {
      displayConfig: props.config,
      displayUser: props.activeUser,
      loading: false,
      selectedCoinObj: this.coinsWithSettings[0],
    }

    this.setCards = this.setCards.bind(this)
    this.setTabs = this.setTabs.bind(this)
    this.getDisplayConfig = this.getDisplayConfig.bind(this)
    this.getDisplayUser = this.getDisplayUser.bind(this)
    this.saveChanges = this.saveChanges.bind(this)
    this.updateCoinSelection = this.updateCoinSelection.bind(this)
    this.setTabs()
    this.setCards()
  }

  componentDidMount() {
    //Set default navigation path to dashboard if wallet is opened without a sub-navigation location
    if (!this.props.mainPathArray[3]) this.props.dispatch(setMainNavigationPath(`${this.props.mainPathArray.join('/')}/${PROFILE_SETTINGS}`)) 
  }

  componentDidUpdate(lastProps) {
    if (lastProps != this.props) {
      this.setCards()
    }
  }

  updateCoinSelection(e) {
    const selectedCoinObj = JSON.parse(e.target.options[e.target.selectedIndex].value)
    
    this.setState({ selectedCoinObj })
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.config != this.state.displayConfig) {
      this.setState({ displayConfig: nextProps.config })
    }

    if (nextProps.activeUser != this.state.displayUser) {
      this.setState({ displayUser: nextProps.activeUser })
    }
  }

  getDisplayConfig(displayConfig) {
    this.setState({ displayConfig })
  }

  getDisplayUser(displayUser) {
    this.setState({ displayUser })
  }

  setTabs() {
    this.props.setTabs(SettingsTabsRender.call(this))
  }

  openSettings(settingsType) {
    this.props.dispatch(setMainNavigationPath(`${getPathParent(this.props.mainPathArray)}/${settingsType}`))
  }

  async saveChanges() {
    if (this.state.loading) return false

    const { displayConfig, displayUser } = this.state
    const { loadedUsers, dispatch, config, activeUser } = this.props
    const configChanged = displayConfig !== config
    const userChanged = displayUser !== activeUser
    const authorizationSettingChanged =
      nativeAuthorizationSetting(displayConfig) !== nativeAuthorizationSetting(config)

    if (!configChanged && !userChanged) return true

    this.setState({ loading: true })

    let configSaved = false
    let userSaved = false
    let saveError = null
    let refreshError = null

    try {
      if (configChanged) {
        await saveConfig(displayConfig)
        configSaved = true
      }

      if (userChanged) {
        await saveUsers({ ...loadedUsers, [displayUser.id]: displayUser})
        userSaved = true
      }
    } catch (e) {
      console.error(e)
      saveError = e
    }

    try {
      // Re fetch data from config and user file to ensure everything made sense
      // and was saved correctly and to prevent user from being surprised if
      // config isnt what they intended it to be
      const actionArray = await Promise.all([initUsers(), initConfig()])
      const userAction = actionArray[0]
      const configActionArr = actionArray[1]

      dispatch(userAction)
      configActionArr.forEach(configAction => {
        dispatch(configAction)
      })
    } catch (e) {
      console.error(e)
      refreshError = e
    } finally {
      this.setState({ loading: false })
    }

    if (saveError) {
      const partialSave = configSaved && userChanged && !userSaved
      const prefix = partialSave
        ? "Configuration was saved, but profile settings were not saved"
        : "Unable to save settings"
      let message = `${prefix}: ${errorSentence(saveError)}`

      if (refreshError) {
        message += ` Saved values could not be reloaded: ${errorSentence(refreshError)}`
      }
      if (authorizationSettingChanged && configSaved) {
        message += " The OS verification preference is already in effect."
      }

      dispatch(newSnackbar(ERROR_SNACK, message, MID_LENGTH_ALERT))
      return false
    }

    if (refreshError) {
      const immediateEffectNotice = authorizationSettingChanged
        ? " The OS verification preference is already in effect."
        : ""
      dispatch(
        newSnackbar(
          ERROR_SNACK,
          `Settings were saved, but the saved values could not be reloaded: ${errorSentence(refreshError)}${immediateEffectNotice}`,
          MID_LENGTH_ALERT
        )
      )
      return false
    }

    const successMessage = authorizationSettingChanged
      ? "Settings saved successfully. The OS verification preference takes effect immediately; restart Verus Desktop for any other settings that require it."
      : "Settings saved successfully. Restart Verus Desktop for settings that require it."

    dispatch(newSnackbar(SUCCESS_SNACK, successMessage, MID_LENGTH_ALERT))
    return true
  }

  setCards() {
    this.props.setCards(SETTINGS_TYPES.map(settingsType => {
      return SettingsCardRender.call(this, settingsType)
    }))
  }

  render() {
    return SettingsRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    mainPathArray: state.navigation.mainPathArray,
    config: state.settings.config,
    activeUser: state.users.activeUser,
    loadedUsers: state.users.loadedUsers,
    activeCoins: state.coins.activatedCoins
  };
};

export default connect(mapStateToProps)(Settings);
