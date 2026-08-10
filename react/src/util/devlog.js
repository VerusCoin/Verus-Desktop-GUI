const devlog = (msg) => {
  const mainWindow = window.require('@electron/remote').getGlobal('app');

  if (mainWindow.appConfig.general.main.dev === true) {
    console.warn(msg);
  }
}

export default devlog;
