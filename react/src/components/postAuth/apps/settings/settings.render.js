import React from 'react';
import SettingsStyles from './settings.styles'
import { PROFILE_SETTINGS, GENERAL_SETTINGS, COIN_SETTINGS } from '../../../../util/constants/componentConstants';
import GeneralSettings from './generalSettings/generalSettings'
import ProfileSettings from './profileSettings/profileSettings'
import CoinSettings from './coinSettings/coinSettings'

//TODO: Move this to translate function
const SETTINGS_NAMES = {
  [PROFILE_SETTINGS]: "Profile Settings",
  [GENERAL_SETTINGS]: "General Settings",
  [COIN_SETTINGS]: "Coin Settings"
}

export const SettingsRender = function() {
  const { state, getDisplayConfig, getDisplayUser, props, updateCoinSelection, coinsWithSettings } = this
  const { displayConfig, displayUser, loading, selectedCoinObj } = state
  const { config, activeUser, mainPathArray } = props

  const COMPONENT_PROPS = {
    displayConfig,
    setDisplayConfig: getDisplayConfig,
    displayUser,
    setDisplayUser: getDisplayUser,
    selectedCoinObj,
    nativeCoins: coinsWithSettings
  }

  const COMPONENT_MAP = {
    [GENERAL_SETTINGS]: <GeneralSettings {...COMPONENT_PROPS} />,
    [PROFILE_SETTINGS]: <ProfileSettings {...COMPONENT_PROPS} />,
    [COIN_SETTINGS]: <CoinSettings {...COMPONENT_PROPS} />
  };

  return (
    <div className="col-md-8 col-lg-9" style={{ padding: 16, width: "80%", overflow: "scroll" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={ this.saveChanges }
          disabled = { loading || (displayConfig === config && displayUser === activeUser) }
          style={{
            fontSize: 14,
            backgroundColor: "rgb(74, 166, 88)",
            borderWidth: 1,
            borderColor: "rgb(74, 166, 88)",
            paddingRight: 20,
            paddingLeft: 20,
            marginBottom: 16
          }}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        { this.props.mainPathArray[3] === COIN_SETTINGS &&
          <select
            value={ JSON.stringify(selectedCoinObj) }
            className="custom-select custom-select-lg" 
            style={{
              fontSize: 14,
              maxWidth: 200
            }}
            onChange={ updateCoinSelection }>
              {coinsWithSettings.map((coinObj, index) => {
                return (
                  <option 
                    key={index} 
                    // Value must be converted to string because traditional JSX forms do not
                    // support JSON objects as values
                    value={JSON.stringify(coinObj)}>{`${coinObj.name} (${coinObj.id})`}</option>)
              })}
          </select>
        }
      </div>
      { mainPathArray[3] ? COMPONENT_MAP[mainPathArray[3]] : null }
    </div>
  );
}

export const SettingsCardRender = function(settingsType) {
  const isActive = this.props.mainPathArray.includes(settingsType)

  return (
    <button 
      className="unstyled-button" 
      onClick={() => this.openSettings(settingsType)} 
      key={settingsType}
      style={SettingsStyles.cardClickableContainer}>
      <div
        className="d-flex flex-column align-items-end"
        style={SettingsStyles.cardContainer}>
        <div className={`card ${isActive ? 'active-card' : 'border-on-hover'}`} style={SettingsStyles.cardInnerContainer}>
          <div
            className="card-body d-flex justify-content-center">
            <h4
              style={SettingsStyles.cardCoinName}>
              <strong>{SETTINGS_NAMES[settingsType]}</strong>
            </h4>
          </div>
        </div>
      </div>
    </button>
  )
}

export const SettingsTabsRender = function() {
  return []
}
