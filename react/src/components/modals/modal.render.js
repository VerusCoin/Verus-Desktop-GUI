import React from "react";
import {
  ADD_COIN,
  CHAIN_INFO,
  ID_INFO,
  PBAAS_CHAIN_INFO,
  RECEIVE_COIN,
  SEND_COIN,
  TX_INFO,
  CSV_EXPORT,
  OPERATION_INFO,
  CREATE_IDENTITY,
  SIGN_VERIFY_ID_DATA,
  SHIELDCOINBASE,
  CURRENCY_INFO,
  BASIC_MODAL,
  SPLIT_MODAL,
  CONVERT_CURRENCY,
  CHAIN_OPTIONS,
  SETUP_VAULT,
  WALLET_IMPORT,
  IMMATURE_DETAILS,
  STARTBRIDGEKEEPER,
  GIFT_CARD
} from "../../util/constants/componentConstants";
import AddCoin from "./addCoin/addCoin";
import SetupVault from "./setupVault/setupVault";
import ChainInfo from "./chainInfo/chainInfo";
import ChainOptions from "./chainOptions/chainOptions";
import IdInfo from "./idInfo/idInfo";
import CurrencyInfo from "./currencyInfo/currencyInfo";
import PbaasChainInfo from "./pbaasChainInfo/pbaasChainInfo";
import ReceiveCoin from "./receiveCoin/receiveCoin";
import ConvertCurrency from "./convertCurrency/convertCurrency";
import SendCoin from "./sendCoin/sendCoin";
import CreateIdentity from "./createIdentity/createIdentity";
import TxInfo from "./txInfo/txInfo";
import ExportToCsv from "./exportToCsv/exportToCsv";
import OperationInfo from "./operationInfo/operationInfo";
import ImmatureDetails from "./immatureDetails/immatureDetails";
import SignVerifyIdData from "./signVerifyIdData/signVerifyIdData";
import GiftCard from "./giftCard/giftCard";
import ShieldCoinbase from "./shieldCoinbase/shieldCoinbase";
import Bridgekeeper from "./bridgekeeper/bridgekeeper";
import { BasicModalRender } from "./modalTypes/basicModal.render";
import { SplitModalRender } from "./modalTypes/splitModal.render";
import ImportWallet from "./importWallet/importWallet";

export const ModalRender = function() {
  const COMPONENT_PROPS = {
    setModalHeader: this.getModalHeader,
    setModalLinks: this.getModalLinks,
    setModalIcon: this.getModalIcon,
    setModalButtons: this.getModalButtons,
    modalPathArray: this.state.modalPath,
    setModalLock: this.getModalLock,
    closeModal: this.closeModal,
    isModalLocked: this.state.modalLock
  }

  const MODAL_MAP = {
    [BASIC_MODAL]: BasicModalRender,
    [SPLIT_MODAL]: SplitModalRender
  }
  
  const COMPONENT_MAP = {
    [ADD_COIN]: <AddCoin {...COMPONENT_PROPS} />,
    [SETUP_VAULT]: <SetupVault {...COMPONENT_PROPS} />,
    [CHAIN_INFO]: <ChainInfo {...COMPONENT_PROPS} />,
    [CHAIN_OPTIONS]: <ChainOptions {...COMPONENT_PROPS} />,
    [ID_INFO]: <IdInfo {...COMPONENT_PROPS} />,
    [CURRENCY_INFO]: <CurrencyInfo {...COMPONENT_PROPS} />,
    [PBAAS_CHAIN_INFO]: <PbaasChainInfo {...COMPONENT_PROPS} />,
    [RECEIVE_COIN]: <ReceiveCoin {...COMPONENT_PROPS} />,
    [CONVERT_CURRENCY]: <ConvertCurrency {...COMPONENT_PROPS} />,
    [SEND_COIN]: <SendCoin {...COMPONENT_PROPS} />,
    [CREATE_IDENTITY]: <CreateIdentity {...COMPONENT_PROPS} />,
    [TX_INFO]: <TxInfo {...COMPONENT_PROPS} />,
    [CSV_EXPORT]: <ExportToCsv {...COMPONENT_PROPS} />,
    [WALLET_IMPORT]: <ImportWallet {...COMPONENT_PROPS} />,
    [OPERATION_INFO]: <OperationInfo {...COMPONENT_PROPS} />,
    [IMMATURE_DETAILS]: <ImmatureDetails {...COMPONENT_PROPS} />,
    [SIGN_VERIFY_ID_DATA]: <SignVerifyIdData {...COMPONENT_PROPS} />,
    [GIFT_CARD]: <GiftCard {...COMPONENT_PROPS} />,
    [SHIELDCOINBASE]: <ShieldCoinbase {...COMPONENT_PROPS} />,
    [STARTBRIDGEKEEPER]: <Bridgekeeper {...COMPONENT_PROPS} />,
  };

  return MODAL_MAP[this.state.modalPath[0]] != null
    ? MODAL_MAP[this.state.modalPath[0]].call(
        this,
        COMPONENT_MAP[this.state.modalPath[1]]
      )
    : BasicModalRender.call(
      this,
      COMPONENT_MAP[this.state.modalPath[0]]
    );
}


