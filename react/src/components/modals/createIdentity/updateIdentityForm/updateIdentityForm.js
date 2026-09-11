import React from 'react';
import { connect } from 'react-redux';
import { 
  UpdateIdentityFormRender
} from './updateIdentityForm.render';
import {
  WARNING_SNACK,
  TXDATA_STATUS,
  TXDATA_ERROR,
  CONFIRM_DATA,
  ERROR_INVALID_Z_ADDR,
  NATIVE,
  ERROR_INVALID_ADDR,
  ERROR_INVALID_ID,
  ENTER_DATA,
  LONG_ALERT,
  CREATE_IDENTITY
} from "../../../../util/constants/componentConstants";
import { newSnackbar } from '../../../../actions/actionCreators';
import { checkAddrValidity } from '../../../../util/addrUtils';

export class UpdateIdentityForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      primaryAddress: "",
      revocationId: "",
      recoveryId: "",
      privateAddr: "",
      formErrors: {
        name: [],
        primaryAddress: [],
        revocationId: [],
        recoveryId: [],
        privateAddr: []
      },
      txDataDisplay: {}
    };

    this.updateFormData = this.updateFormData.bind(this);
    //this.updateControlAddr = this.updateControlAddr.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.updateFormErrors = this.updateFormErrors.bind(this);
    this.generateTxDataDisplay = this.generateTxDataDisplay.bind(this);
    this.setRecoverSelf = this.setRecoverSelf.bind(this);
    this.setRevokeSelf = this.setRevokeSelf.bind(this);
    this.initFormData = this.initFormData.bind(this);
  }

  componentWillMount() {
    if (Object.keys(this.props.txData).length > 0) {
      this.generateTxDataDisplay();
    }
  }

  componentDidMount() {
    const { formStep, identity } = this.props

    if (formStep === ENTER_DATA && identity != null) {
      this.initFormData()
    }
  }

  initFormData() {
    const {
      identityaddress,
      primaryaddresses,
      revocationauthority,
      recoveryauthority,
      privateaddress
    } = this.props.identity.identity;

    this.setState(
      {
        name: identityaddress || "",
        primaryAddress: primaryaddresses[0],
        revocationId: revocationauthority,
        recoveryId: recoveryauthority,
        privateAddr: privateaddress
      },
      () => {
        this.updateFormErrors(this.updateFormData);
      }
    );
  }

  componentDidUpdate(lastProps) {
    const { formStep, identity, setContinueDisabled } = this.props;

    if (lastProps.formStep !== formStep && formStep === ENTER_DATA) {
      setContinueDisabled(true)

      if (identity != null) {
        this.initFormData()
      }
    }
  }

  generateWarningSnack(warnings) {
    this.props.dispatch(newSnackbar(WARNING_SNACK, warnings[0].message, LONG_ALERT));
  }

  setRecoverSelf() {
    this.updateInput({
      target: {
        name: "recoveryId",
        value: `${this.props.nameCommitmentObj.namereservation.name}@`
      }
    });
  }

  setRevokeSelf() {
    this.updateInput({
      target: {
        name: "revocationId",
        value: `${this.props.nameCommitmentObj.namereservation.name}@`
      }
    });
  }

  generateTxDataDisplay() {
    const { txData, formStep } = this.props;

    const {
      chainTicker,
      name,
      primaryaddresses,
      revocationauthority,
      recoveryauthority,
      privateaddress,
      resulttxid,
      warnings
    } = txData;

    let txDataSchema = {
      ["Status:"]: formStep === CONFIRM_DATA ? null : txData[TXDATA_STATUS],
      ["Error:"]: txData[TXDATA_ERROR],
      ["Name:"]: name,
      ["Chain:"]: chainTicker,
      ["Transaction ID:"]: resulttxid,
      ["Primary Address:"]: primaryaddresses ? primaryaddresses[0] : null,
      ["Revocation ID:"]: revocationauthority,
      ["Recovery ID:"]: recoveryauthority,
      ["Private Address:"]:
        privateaddress != null && privateaddress.length > 0
          ? privateaddress
          : null
    };

    Object.keys(txDataSchema).forEach(txDataKey => {
      if (txDataSchema[txDataKey] == null) delete txDataSchema[txDataKey];
    });

    if (formStep === CONFIRM_DATA && warnings && warnings.length > 0) {
      this.generateWarningSnack(warnings);
    }

    this.setState({ txDataDisplay: txDataSchema });
  }

  updateFormErrors(cb) {
    //TODO: Add more errors in here by checking controlAddr and referralId
    const { setContinueDisabled, activeCoin } = this.props;
    const {
      name,
      primaryAddress,
      revocationId,
      recoveryId,
      privateAddr
    } = this.state;
    let formErrors = {
      name: [],
      primaryAddress: [],
      revocationId: [],
      recoveryId: [],
      privateAddr: []
    };

    if (
      privateAddr != null &&
      privateAddr.length > 0 &&
      !(
        privateAddr[0] === "z" &&
        (privateAddr.length === 95 || privateAddr.length === 78)
      )
    ) {
      formErrors.privateAddr.push(ERROR_INVALID_Z_ADDR);
    }

    if (
      primaryAddress.length !== 0 &&
      !checkAddrValidity(primaryAddress, NATIVE, activeCoin.id)
    ) {
      formErrors.primaryAddress.push(ERROR_INVALID_ADDR);
    }

    if (
      revocationId != null &&
      revocationId.length > 0 &&
      revocationId[revocationId.length - 1] !== "@" &&
      revocationId[0] !== "i"
    ) {
      formErrors.revocationId.push(ERROR_INVALID_ID);
    }

    if (
      recoveryId != null &&
      recoveryId.length > 0 &&
      recoveryId[recoveryId.length - 1] !== "@" &&
      recoveryId[0] !== "i"
    ) {
      formErrors.recoveryId.push(ERROR_INVALID_ID);
    }

    if (
      name != null &&
      name.length > 0 &&
      name[name.length - 1] !== "@" &&
      name[0] !== "i"
    ) {
      formErrors.name.push(ERROR_INVALID_ID);
    }

    //TODO: ID & name validation

    this.setState({ formErrors }, () => {
      setContinueDisabled(
        !Object.keys(this.state.formErrors).every(formInput => {
          return this.state.formErrors[formInput].length == 0;
        }) ||
          name.length === 0 ||
          revocationId.length === 0 ||
          recoveryId.length === 0 ||
          primaryAddress.length === 0
      );
      if (cb != null) cb();
    });
  }

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormErrors();
      this.updateFormData();
    });
  }

  updateInput(e) {
    this.setAndUpdateState({ [e.target.name]: e.target.value });
  }

  updateFormData() {
    const {
      primaryAddress,
      revocationId,
      recoveryId,
      privateAddr,
      name
    } = this.state;

    this.props.setFormData({
      ...this.props.formData,
      name: name,
      controlAddress: primaryAddress,
      revocationAuthority: revocationId,
      recoveryAuthority: recoveryId,
      privateAddress: privateAddr
    });
  }

  render() {
    return UpdateIdentityFormRender.call(this);
  }
}

const mapStateToProps = (state) => {
  const { chainTicker } = state.modal[CREATE_IDENTITY]

  return {
    identity: state.modal[CREATE_IDENTITY].identity,
    addresses: state.ledger.addresses,
    activeCoin: state.coins.activatedCoins[chainTicker],
  };
};

export default connect(mapStateToProps)(UpdateIdentityForm);