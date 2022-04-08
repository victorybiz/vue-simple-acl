/**
 * Augment the typings of Vue.js
 */

import { AbilitiesEvaluation } from './acl';

declare global {
  interface Window {
    Vue: any;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $can: {
      (): AbilitiesEvaluation;
      all: AbilitiesEvaluation;
      not: AbilitiesEvaluation;
      any: AbilitiesEvaluation;
    }
  }
}
