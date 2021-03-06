/*
  The coin reducer conatains management data for api calls 
  to the main backend process
*/

import {
  ADD_CALLED_TIME,
} from "../util/constants/storeType";

export const api = (state = {
  calledTimes: []
}, action) => {
  switch (action.type) {
    case ADD_CALLED_TIME:
      let newCalledTimes = [...state.calledTimes, action.payload.time]
      newCalledTimes = newCalledTimes.filter(
        (x) =>
          x > action.payload.time - 600000 && x < action.payload.time + 600000
      );

      return {
        ...state,
        calledTimes: newCalledTimes
      };
    default:
      return state;
  }
}