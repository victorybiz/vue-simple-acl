// VueSimpleAcl.js
import useSimpleAcl from './composables/useSimpleAcl';

const { installPlugin, createAcl, defineAclRules, useAcl } = useSimpleAcl();

/**
 * The Plugin
 */
const VueSimpleAcl = {
  install: (app, options = {}) => installPlugin(app, options),
}

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueSimpleAcl);
} else if (typeof global !== 'undefined') {
  global.Vue.use(VueSimpleAcl);
}

export {
  // VueSimpleAcl,
  createAcl,
  defineAclRules,
  useAcl
}

// export default VueSimpleAcl;