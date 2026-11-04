import React from 'react';
import CreateGiftCardForm from "./createGiftCardForm/createGiftCardForm";
import FundGiftCardForm from "./fundGiftCardForm/fundGiftCardForm";
import {
  ENTER_DATA,
  CONFIRM_DATA,
  SEND_RESULT,
  API_SUCCESS,
  CREATE_GIFT_CARD,
  FUND_GIFT_CARD
} from '../../../util/constants/componentConstants';
import Button from '@material-ui/core/Button';
import SimpleLoader from '../../../containers/SimpleLoader/SimpleLoader'

export const GiftCardRender = function() {
  const { advanceFormStep, state, back, props } = this
  const { loading, continueDisabled, formStep, txData } = state
  const { closeModal, modalProps } = props
  const isFund = modalProps.modalType === FUND_GIFT_CARD

  return (
    <div style={{ width: "100%", paddingLeft: 35, paddingRight: 35 }}>
      {loading
        ? GiftCardRenderLoading.call(this)
        : GiftCardFormRender.call(this)}
      {!loading && (
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: isFund ? "space-between" : "flex-end"
          }}
        >
          {isFund && (
            <Button
              variant="contained"
              onClick={back}
              size="large"
              color="default"
              style={{
                marginBottom: 10,
                visibility:
                  formStep === CONFIRM_DATA ||
                  (formStep === SEND_RESULT && txData.status !== API_SUCCESS)
                    ? "unset"
                    : "hidden"
              }}
            >
              {"Back"}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={ formStep === SEND_RESULT ? closeModal : advanceFormStep }
            disabled={continueDisabled}
            size="large"
            color="primary"
            style={{ marginBottom: 10 }}
          >
            {!isFund
              ? "Create"
              : formStep === ENTER_DATA
              ? "Verify and Build"
              : formStep === CONFIRM_DATA
              ? "Confirm"
              : "Done"}
          </Button>
        </div>
      )}
    </div>
  );
}

export const GiftCardFormRender = function() {
  const { state, props, getFormData, getContinueDisabled } = this;
  const { modalProps, closeModal } = props;

  if (modalProps.modalType === CREATE_GIFT_CARD) {
    return (
      <CreateGiftCardForm
        {...modalProps}
        {...state}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    );
  } else if (modalProps.modalType === FUND_GIFT_CARD) {
    return (
      <FundGiftCardForm
        {...modalProps}
        {...state}
        closeModal={closeModal}
        setFormData={getFormData}
        setContinueDisabled={getContinueDisabled}
      />
    );
  }
};

export const GiftCardRenderLoading = function() {
  const { modalProps, giftCard } = this.props
  const { formStep } = this.state
  let loadingText = "Creating gift card..."

  if (modalProps.modalType === FUND_GIFT_CARD) {
    loadingText =
      formStep !== ENTER_DATA
        ? "Submitting signed gift card funding transactions..."
        : giftCard != null && giftCard.encrypted
        ? "Decrypting and verifying gift card address..."
        : "Verifying gift card address..."
  }

  return (
    <div
      className="d-sm-flex flex-column justify-content-sm-center"
      style={{ paddingBottom: 40, height: "100%" }}>
      <div
        className="d-flex d-sm-flex justify-content-center justify-content-sm-center"
        style={{ paddingBottom: 40 }}
      >
        <SimpleLoader size={75} text={loadingText}/>
      </div>
    </div>
  )
}
