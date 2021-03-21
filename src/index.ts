// VueSimpleAcl.js
import { installPlugin, createAcl, defineAclRules, useAcl } from './VueSimpleAcl';
import { PluginOption } from './@types';

/**
 * The Plugin
 */
const VueSimpleAcl = {
  install: (app: any, options?: PluginOption) => installPlugin(app, options),
}


// necessary to fix typescript for automatic installation
declare global {
  interface Window {
    Vue: any;
  }
}
// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueSimpleAcl);
}

export {
  // VueSimpleAcl,
  createAcl,
  defineAclRules,
  useAcl
}

// export default VueSimpleAcl;