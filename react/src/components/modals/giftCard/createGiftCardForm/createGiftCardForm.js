import React from 'react';
import {
  CreateGiftCardFormRender
} from './createGiftCardForm.render';
import {
  ERROR_GIFT_CARD_PASSWORD_MISMATCH
} from "../../../../util/constants/componentConstants";

class CreateGiftCardForm extends React.Component {
  constructor(props) {
    super(props);
    const { formData } = props

    this.state = {
      label: formData.label != null ? formData.label : '',
      requirePassword: formData.password != null,
      password: formData.password != null ? formData.password : '',
      confirmPassword: formData.password != null ? formData.password : '',
      formErrors: {
        password: [],
        confirmPassword: [],
      }
    }

    this.updateFormData = this.updateFormData.bind(this)
    this.setAndUpdateState = this.setAndUpdateState.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.updateFormErrors = this.updateFormErrors.bind(this)
    this.toggleRequirePassword = this.toggleRequirePassword.bind(this)
  }

  componentDidMount() {
    this.updateFormErrors()
  }

  updateFormErrors() {
    const { setContinueDisabled } = this.props
    const { requirePassword, password, confirmPassword } = this.state
    let formErrors = {
      password: [],
      confirmPassword: [],
    }

    if (requirePassword && confirmPassword.length > 0 && password !== confirmPassword) {
      formErrors.confirmPassword.push(ERROR_GIFT_CARD_PASSWORD_MISMATCH)
    }

    this.setState({ formErrors }, () => {
      setContinueDisabled(
        !Object.keys(this.state.formErrors).every(formInput => {
          return this.state.formErrors[formInput].length == 0;
        }) ||
          (requirePassword && (password.length === 0 || password !== confirmPassword))
      );
    })
  }

  setAndUpdateState(stateModifiers) {
    this.setState(stateModifiers, () => {
      this.updateFormErrors()
      this.updateFormData()
    })
  }

  updateInput(e) {
    this.setAndUpdateState({ [e.target.name]: e.target.value })
  }

  toggleRequirePassword() {
    this.setAndUpdateState({ requirePassword: !this.state.requirePassword })
  }

  updateFormData() {
    const {
      label,
      requirePassword,
      password
    } = this.state;

    this.props.setFormData({
      ...this.props.formData,
      label,
      password: requirePassword ? password : undefined
    });
  }

  render() {
    return CreateGiftCardFormRender.call(this);
  }
}

export default CreateGiftCardForm;
