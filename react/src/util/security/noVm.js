'use strict';

const disabled = () => {
  throw new Error('Dynamic vm execution is disabled in the renderer.');
};

module.exports = {
  createContext: disabled,
  createScript: disabled,
  runInContext: disabled,
  runInNewContext: disabled,
  runInThisContext: disabled,
};
