import React from 'react';
import ProtectedInputForm from '../../../containers/ProtectedInputForm/ProtectedInputForm'

export const UnlockProfileRender = function() {
  return this.state.formHidden ? null : (
    <form className="pre-auth-body-container">
      <h2 className="text-center">Unlock your profile.</h2>
      <ProtectedInputForm
        heading={`Some coins you have chosen to add on startup require a password.`}
        headingContainerStyle={{
          maxWidth: "100%",
        }}
        submitBtnText="Add Coin"
        onSubmit={this.handleSubmit}
        inlineSubmit={true}
        helperText={this.state.formError ? this.state.formError : ""}
        inputDisabled={this.state.formLock}
        submitDisabled={this.state.formLock}
        inputRef={(input) => {
          this.pwdInput = input;
        }}
        error={this.state.formError ? true : false}
      />
      <div className="form-group d-flex justify-content-between">
        <button
          className="btn btn-primary pre-auth-button"
          onClick={this.finishLogin}
          disabled={this.state.formLock}
        >
          skip for now
        </button>
      </div>
    </form>
  );
}


