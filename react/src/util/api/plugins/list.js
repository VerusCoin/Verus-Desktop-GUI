import { API_LIST_PLUGINS } from "../../constants/componentConstants"
import { apiGet } from "../callCreator"

/**
 * Lists all plugins
 */
export const listPlugins = async () => {
  try {
    const res = await apiGet(API_LIST_PLUGINS)
    if (res.msg !== 'success') throw new Error(res.result)
    else return res.result
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}