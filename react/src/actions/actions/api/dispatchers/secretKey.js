import { secretToken, pluginInfo } from '../../../../config';
import store from '../../../../store';
import { ADD_CALLED_TIME } from '../../../../util/constants/storeType'
var blake2b = require('blake2b')

export const getSecretKey = (data) => {
  // Get current time
  let time = new Date().valueOf();

  // Avoid potential conflicts with current time
  while (store.getState().api.calledTimes.includes(time)) time++

  const token = secretToken

  var hash = blake2b(64)

  // Create validity key according to spec
  hash.update(Buffer.from(time.toString()))
  hash.update(Buffer.from(token))
  hash.update(Buffer.from(data))
  hash.update(Buffer.from(pluginInfo.id))

  // Store time used to avoid conflicts
  store.dispatch({
    type: ADD_CALLED_TIME,
    payload: {
      time
    }
  })

  // Return validity key and time used
  return {
    hash: hash.digest('hex'),
    time: time.toString()
  }
}