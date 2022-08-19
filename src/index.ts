// VueSimpleAcl.js
import { PluginOption } from '../types';
import { installPlugin, createAcl, defineAclRules, useAcl } from './VueSimpleAcl';

/**
 * The Plugin
 */
const VueSimpleAcl = {
  install: (app: any, options?: PluginOption) => installPlugin(app, options),
}

// Automatic installation if Vue has been added to the global scope.
// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(VueSimpleAcl);
// }

export {
  createAcl,
  defineAclRules,
  useAcl,
};

export default VueSimpleAcl;