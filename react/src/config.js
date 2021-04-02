let Config = {}
let BuiltinSecret = ""

try {
  Config = window.bridge.getConfigSync()
} catch(e) {
  console.error("Error loading config!")
  console.error(e)
  Config = window.bridge.defaultConfig
}

try {
  BuiltinSecret = window.bridge.getSecretSync().BuiltinSecret
} catch(e) {
  console.error("Error loading api secrets!")
  console.error(e)
}

export const agamaPort = Config.general.main.agamaPort;
export const apiEncryption = Config.general.main.encryptApiPost
export const secretToken = BuiltinSecret
export const pluginInfo = {
  builtin: true,
  id: "VERUS_DESKTOP_MAIN"
}

export default Config;