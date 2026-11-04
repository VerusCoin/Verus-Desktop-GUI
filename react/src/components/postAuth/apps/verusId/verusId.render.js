import React from 'react';
import VerusIdStyles from './verusId.styles'
import {
  DASHBOARD,
  GIFT_CARDS,
  CHAIN_FALLBACK_IMAGE,
  ADD_DEFAULT_COIN,
  POST_SYNC
} from "../../../../util/constants/componentConstants";
import { openAddCoinModal } from '../../../../actions/actionDispatchers';
import CircularProgress from '@material-ui/core/CircularProgress';
import CurrencySelector from '../../../../containers/CurrencySelector/CurrencySelector';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button
} from "@material-ui/core";

export const IdCardRender = function(coinObj) {
  const { identities } = this.props
  const { activeId } = this.state
  const coinIdentities = identities[coinObj.id] || []
  const errorOrLoading = coinObj.status !== POST_SYNC

  return (
    <div
      className="unstyled-button"
      //onClick={() => this.openCoin(coinObj.id)} key={coinObj.id}
      style={VerusIdStyles.cardClickableContainer}
    >
      <div className="d-flex flex-column align-items-end" style={VerusIdStyles.cardContainer}>
        <div
          className={`card ${
            activeId.chainTicker === coinObj.id ? "active-card" : "border-on-hover"
          }`}
          style={VerusIdStyles.cardInnerContainer}
        >
          {errorOrLoading && (
            <div
              style={{
                color: `rgb(49, 101, 212)`,
                alignSelf: "flex-end",
                height: 20,
              }}
            >
              <CircularProgress
                variant={"indeterminate"}
                thickness={4.5}
                size={20}
                color="inherit"
              />
            </div>
          )}
          <div
            className="card-body"
            style={{
              ...VerusIdStyles.cardBody,
              paddingTop: errorOrLoading ? 0 : 20,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="d-flex" style={VerusIdStyles.cardCoinInfoContainer}>
              <img
                src={`assets/images/cryptologo/btc/${coinObj.id.toLowerCase()}.png`}
                width="25px"
                height="25px"
                onError={(e) => {
                  e.target.src = CHAIN_FALLBACK_IMAGE;
                }}
              />
              <h4 style={VerusIdStyles.cardCoinName}>
                <strong>{coinObj.name}</strong>
              </h4>
            </div>
            <FormControl variant="outlined" style={{ flex: 1, marginTop: 8, marginBottom: 8 }}>
              <InputLabel>{"Identity"}</InputLabel>
              <Select
                value={
                  activeId.idIndex != null && activeId.chainTicker === coinObj.id
                    ? activeId.idIndex
                    : ""
                }
                onChange={(e) => this.openId(coinObj.id, e.target.value)}
                labelWidth={62}
              >
                {coinIdentities.map((idObj, index) => {
                  const { identity } = idObj;
                  return (
                    <MenuItem
                      key={index}
                      value={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <div>{`${identity.name}@`}</div>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <CurrencySelector coin={coinObj.id} />
            <Button
              variant="outlined"
              onClick={() => this.openSearchModal(coinObj.id)}
              style={{ marginTop: 8 }}
            >
              <i className={"fas fa-search"} style={{ paddingRight: 6, color: "black" }} />
              {"ID Search"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const IdTabsRender = function() {
  return [
    {
      title: "VerusID Dashboard",
      icon: 'fa-home',
      onClick: () => this.openDashboard(),
      isActive: () => this.props.mainPathArray.includes(DASHBOARD)
    },
    ...(this.props.experimentalFeatures
      ? [
          {
            title: "Gift Cards",
            icon: 'fa-gift',
            onClick: () => this.openGiftCards(),
            isActive: () => this.props.mainPathArray.includes(GIFT_CARDS)
          }
        ]
      : []),
    {
      title: "Add Coin",
      icon: 'fa-plus',
      onClick: () => openAddCoinModal(ADD_DEFAULT_COIN),
      isActive: () => false
    }
  ];
}