import Store from "../store"
import { newSnackbar } from "../actions/actionCreators"
import { SUCCESS_SNACK, MID_LENGTH_ALERT } from "./constants/componentConstants"

export const copyDataToClipboard = (data, message = data + " copied to clipboard") => {
  navigator.clipboard.writeText(data)
  Store.dispatch(newSnackbar(SUCCESS_SNACK, message, MID_LENGTH_ALERT))
}