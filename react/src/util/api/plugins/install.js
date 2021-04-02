import { API_INSTALL_PLUGIN } from "../../constants/componentConstants"
import { apiPost } from "../callCreator"

/**
 * Attempts to install the plugin bundle at the specified path
 * @param {Object} path 
 */
export const installPlugin = async (path) => {
  try {
    const res = await apiPost(API_INSTALL_PLUGIN, { path })
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}