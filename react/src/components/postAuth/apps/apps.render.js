import React from "react";
import AppsStyles from './apps.styles'
import { WALLET, MINING, VERUSID, SETTINGS } from '../../../util/constants/componentConstants'
import Mining from './mining/mining'
import Wallet from './wallet/wallet'
import Settings from './settings/settings'
import VerusId from './verusId/verusId'
import fiatList from '../../../util/constants/fiatList'
import Tooltip from '@material-ui/core/Tooltip';

export const AppsRender = function() {
  const COMPONENT_MAP = {
    [MINING]: (
      <Mining setCards={this.getCards} setTabs={this.getSecondaryTabs} />
    ),
    [WALLET]: (
      <Wallet setCards={this.getCards} setTabs={this.getSecondaryTabs} />
    ),
    [SETTINGS]: (
      <Settings setCards={this.getCards} setTabs={this.getSecondaryTabs} />
    ),
    [VERUSID]: (
      <VerusId setCards={this.getCards} setTabs={this.getSecondaryTabs} />
    ),
  };

  const currentApp = this.props.mainPathArray[2] ? this.props.mainPathArray[2] : null

  return (
    <div
      style={AppsStyles.viewport}>
      <div
        className="container d-flex flex-column"
        style={AppsStyles.mainContainer}>
        <div className="d-flex flex-row justify-content-between" style={{ minHeight: 46 }}>
          <div>
            <ul
              className="nav nav-tabs"
              style={AppsStyles.mainNavigationTabContainer}>
              <li className={`nav-item ${currentApp === WALLET ? 'active-nav-tab-container' : 'nav-tab-container'}`}>
                <a
                  className={`nav-link text-center ${currentApp === WALLET ? 'active-nav-tab' : 'inactive-nav-tab'}`}
                  onClick={currentApp === WALLET ? () => { return 0 } : () => this.selectApp(WALLET)}
                  style={AppsStyles.mainNavigationTab}>
                  <i 
                    className={`fas fa-wallet ${currentApp === WALLET ? '' : 'inactive-nav-tab-icon'}`} 
                    style={AppsStyles.navigationTabIcon} />
                  {"Wallet"}
                </a>
              </li>
              <li className={`nav-item ${currentApp === VERUSID ? 'active-nav-tab-container' : 'nav-tab-container'}`}>
                <a
                  className={`nav-link text-center ${currentApp === VERUSID ? 'active-nav-tab' : 'inactive-nav-tab'}`}
                  onClick={currentApp === VERUSID ? () => { return 0 } : () => this.selectApp(VERUSID)}
                  style={AppsStyles.mainNavigationTab}>
                  <i 
                    className={`fas fa-fingerprint ${currentApp === VERUSID ? '' : 'inactive-nav-tab-icon'}`} 
                    style={AppsStyles.navigationTabIcon} />
                  {"VerusID"}
                </a>
              </li>
              <li className={`nav-item ${currentApp === MINING ? 'active-nav-tab-container' : 'nav-tab-container'}`}>
                <a
                  className={`nav-link text-center ${currentApp === MINING ? 'active-nav-tab' : 'inactive-nav-tab'}`}
                  onClick={currentApp === MINING ? () => { return 0 } : () => this.selectApp(MINING)}
                  style={AppsStyles.mainNavigationTab}>
                  <i
                    className={`fas fa-tachometer-alt ${currentApp === MINING ? '' : 'inactive-nav-tab-icon'}`}
                    style={AppsStyles.navigationTabIcon}
                  />
                  {"Mining"}
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane active" role="tabpanel" id="tab-1" />
              <div className="tab-pane" role="tabpanel" id="tab-2" />
              <div className="tab-pane" role="tabpanel" id="tab-3" />
            </div>
          </div>
          <div className="d-flex align-items-lg-center">
            <div
              className={`dropdown ${this.state.currencyDropdownOpen ? 'show' : ''}`}
              ref={node => (this.dropdownMenu = node)}>
              <Tooltip title="Change display currency">
                <button
                  className="btn btn-primary dropdown-toggle noshadow"
                  type="button"
                  onClick={this.toggleCurrencyDropdown}
                  style={AppsStyles.topBarMenuItem}>
                  <i className="fas fa-dollar-sign" style={AppsStyles.topBarMenuItemIcon} />
                </button>
              </Tooltip>
              <div
                className={`dropdown-menu ${this.state.currencyDropdownOpen ? 'show' : ''}`}
                role="menu"
                style={AppsStyles.currencyDropdownMenu}>
                <h6 className="dropdown-header" role="presentation">
                  {"fiat currency"}
                </h6>
                {fiatList.map((currency, index) => {
                  return (
                    <a
                      className={`dropdown-item ${this.props.fiatCurrency === currency.toUpperCase() ? 'disabled' : ''}`}
                      role="presentation"
                      href="#"
                      id={index}
                      onClick={() => this.selectFiatCurrency(currency)}
                    >
                      { currency.toUpperCase() }
                    </a>
                  );
                })}
              </div>
            </div>
            <Tooltip title="Settings">
              <button
                className="btn btn-primary noshadow"
                type="button"
                disabled={currentApp === SETTINGS}
                onClick={() => this.selectApp(SETTINGS)}
                style={AppsStyles.topBarMenuItem}>
                <i className="fas fa-cog" style={AppsStyles.topBarMenuItemIcon} />
              </button>
            </Tooltip>
            <Tooltip title="Log Out">
              <button
                className="btn btn-primary noshadow"
                type="button"
                onClick={ this.logoutAccount }
                disabled={ this.state.logoutDisabled }
                style={ AppsStyles.topBarMenuItem }>
                <i className="fas fa-sign-out-alt" style={AppsStyles.topBarMenuItemIcon} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="row" style={AppsStyles.tabUnderline}>
        </div>
        <div
          className="row d-flex flex-fill"
          style={AppsStyles.sideBarContainer}>
          <div
            className="col d-flex flex-column justify-content-between"
            style={AppsStyles.sideBarInnerContainer}>
            <div style={AppsStyles.sideBarContainerScroller} className="hide-scrollbar">
              {this.state.secondaryTabs.map((tab, index) => {
                return (
                  <button
                    className="unstyled-button"
                    onClick={tab.onClick}
                    key={index}
                    style={AppsStyles.cardClickableContainer}
                  >
                    <div
                      className="d-flex flex-column align-items-end"
                      style={AppsStyles.cardContainer}
                    >
                      <div
                        className={`card ${
                          tab.isActive() ? "active-card" : "border-on-hover"
                        }`}
                        style={AppsStyles.cardInnerContainer}
                      >
                        <div style={AppsStyles.cardInnerTextContainer}>
                          <i
                            className={`fas ${tab.icon}`}
                            style={{ paddingRight: 6, color: 'black' }}
                          />
                          {tab.title}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {this.state.cards}
            </div>
            <footer />
          </div>
          {COMPONENT_MAP[currentApp]}
        </div>
      </div>
    </div>
  );
};
