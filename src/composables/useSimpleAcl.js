import { reactive } from 'vue';
import useUtils from './useUtils';

const { getFunctionArgsNames } = useUtils();

export default function useSimpleAcl() {

  // plugin global state
  const state = reactive({
    registeredUser: {},
    registeredRules: {},
    options: {},
  });

  /**
   * Register plugin options to state
   * @param {object} pluginOptions 
   */
  const registerPluginOptions = (pluginOptions) => {
    // Init and set user to state
    if (pluginOptions.user && typeof pluginOptions.user === "function") {
      state.registeredUser = pluginOptions.user();
    } else {
      state.registeredUser = pluginOptions.user;
    }   
    // Run and init the defined rules
    if (pluginOptions.rules && typeof pluginOptions.rules === "function") {
      pluginOptions.rules();
    }
    // Set other user defined plugins to state
    state.options = pluginOptions;
  }

  const asyncAwait = async (promiseObject) => {
    return await promiseObject;
  }


  
  /**
   * Add an ability and its callback to rules state
   * @param {string} ability
   * @param {function} callback 
   * @returns {void}
   */
  const addAclAbility = (ability, callback) => {
    if (!state.registeredRules.hasOwnProperty(ability)) {
      state.registeredRules[ability] = callback;
    } else {
      console.warn(`:::VueSimpleACL::: Duplicate ACL Rule '${ability}' defined. Only the first defined rule will be evaluated.`)
    }
  }

  /**
   * Set an ACL Rule
   * @param {string|object|array} abilities 
   * @param {function} callback 
   * @returns {void}
   */
  const setRule = (abilities, callback) => {
    if (typeof abilities === "string") {
      addAclAbility(abilities, callback);
    } else if (typeof abilities === "object") {     
      Object.values(abilities).forEach((ability) => {
        addAclAbility(ability, callback);
      });
    }
  };

  /**
   * Define ACL Rules
   * @param {function|object} user 
   * @param {function} callback 
   * @returns {void}
   */
  const defineAclRules = (defineAclRulesCallback) => {
    if (typeof defineAclRulesCallback === "function") {
      defineAclRulesCallback(setRule);
    }
  };

  /**
   * Evaluate ability check
   * @param {function} abilities 
   * @param {object|array} args arguments
   * @param {boolean} any
   * @returns {boolean}
   */
  const evaluateAbilityCallback = (ability, abilityCallback, args = null) => {
    try {
      if (typeof abilityCallback === 'function') {
        if (typeof args === 'object' && !Array.isArray(args)) {
          return abilityCallback(state.registeredUser, args);
        } else if (typeof args === 'object' && Array.isArray(args)) {
          return abilityCallback(state.registeredUser, ...args);
        } else {
          return abilityCallback(state.registeredUser);
        }  
      }
      return false;
    } catch (error) {
      // Prepare an error message
      // Get the $can args to be passed from the callback function string
      let callbackArgsNames = getFunctionArgsNames(abilityCallback);
      let StrCallbackArgsNames = null;

      if (callbackArgsNames && Array.isArray(callbackArgsNames)) {
        callbackArgsNames.shift(); // Remove the first ever arg from the args array i.e normally the 'user' arg
        StrCallbackArgsNames = callbackArgsNames.join(', '); // join the arrays back to str after removing user arg
      }
      let customErrorMessage = ':::VueSimpleACL::: The defined ACL Rule for "' + ability + '" require some argument(s) or data object to be specified for matching.';
      customErrorMessage += '\n\nCheck the file containing your defineAclRules((setRule) => {...}); declarations';
      customErrorMessage += '\n\nExamples:';
      if (callbackArgsNames && callbackArgsNames.length <= 0) {
        customErrorMessage += `\nv-can:${ability}`;
        customErrorMessage += `\nv-can="'${ability}'"`;
        customErrorMessage += `\n$can('${ability}')`;
      } else if (callbackArgsNames && callbackArgsNames.length === 1) {
        customErrorMessage += `\nv-can:${ability}="${StrCallbackArgsNames}"`;
        customErrorMessage += `\nv-can="'${ability}', ${StrCallbackArgsNames}"`;
        customErrorMessage += `\n$can('${ability}', ${StrCallbackArgsNames})`;
      } else {
        customErrorMessage += `\nv-can:${ability}="[${StrCallbackArgsNames}]"`;
        customErrorMessage += `\nv-can="'${ability}', [${StrCallbackArgsNames}]"`;
        customErrorMessage += `\n$can('${ability}', [${StrCallbackArgsNames}])`;
      }
      console.error(customErrorMessage);
      console.error(error);
      return false;
    }
  }

  /**
   * Check ACL Abilities
   * @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @param {boolean} any 
   * @returns {boolean}
   */
  const checkAclAbilities = ({abilities, args, any = false}) => {
    if (abilities && typeof abilities === 'string') {
      if (state.registeredRules.hasOwnProperty(abilities)) {
        let callback = state.registeredRules[abilities];
        return evaluateAbilityCallback(abilities, callback, args);
      }
    } else if (typeof abilities === 'object' && Array.isArray(abilities)) {
      let checkStatus = false;
      let callbackResponse = false;
      let counter = 0;
      let validCount = 0;
      abilities.forEach((ability) => {
        if (state.registeredRules.hasOwnProperty(ability.abilities)) {
          let callback = state.registeredRules[ability.abilities];
          callbackResponse =  evaluateAbilityCallback(ability.abilities, callback, ability.args);
          if (validCount) {
            validCount++;
          }
          if (any === true && callbackResponse) {
            checkStatus = true;
          }
          counter++;
        }    
      });
      if (counter > 0 && counter === validCount) {
        checkStatus = true;
      }
      return checkStatus;
    } 
    return false;
  };

  /**
   * Prepare ACL Check
   * 
   * @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @param {boolean} any 
   * @returns {boolean} 
   */
  const prepareAcl = ({ abilities, args, any = false}) => {
    const aclAbilities = abilities;
    const aclArgs = args;
    const anyModifier = any;
    
    let aclStatus = false;
    if (aclAbilities) {
      if (aclArgs) {            
        // v-can:edit-post="post" OR $can('edit-post', post) 
        // OR v-can:hide-comment="[post, comment]" OR $can('hide-commen', [post, comment])
        aclStatus = checkAclAbilities({ abilities: aclAbilities, args: aclArgs });
      } else {
        // v-can:create-post OR $can('create-post')
        aclStatus = checkAclAbilities({ abilities: aclAbilities });
      }       
    } else {
      if (aclArgs && typeof aclArgs === 'string') {
        // v-can="'create-post'" OR $can('create-post')
        aclStatus = checkAclAbilities({ abilities: aclArgs});
      } else if (aclArgs && aclArgs !== null && typeof aclArgs === 'object') {
        // v-can="['edit-post', post]" OR $can(['edit-post', post])
        let argsCount = (Array.isArray(aclArgs)) ? aclArgs.length : Object.keys(object1).length;        
        if (argsCount === 2 && typeof aclArgs[0] === 'string' && typeof aclArgs[1] === 'object' && !Array.isArray(aclArgs[1])) {
          aclStatus = checkAclAbilities({ abilities: aclArgs[0], args: aclArgs[1] });          
        } else {
          // v-can="['create-post', ['edit-post', post]]" OR $can(['create-post', ['edit-post', post]])
          let abilityList = [];
          let argList = [];
          aclArgs.forEach((ability) => {
            if (ability && typeof ability === 'string') {
              // ...=['create-post', ...]
              abilityList.push({ abilities: ability });

            } else if (ability && typeof ability === 'object') {
              // ...=[['edit-post', post], ...]
              let abilityInValue = null;
              let argsInvalue = [];
              ability.forEach((nextedAbility) => {
                if (nextedAbility && !abilityInValue && typeof nextedAbility === 'string') {
                  abilityInValue = nextedAbility;
                } else {
                  argsInvalue.push(nextedAbility);
                }
              });
              if (abilityInValue) {
                abilityList.push({ abilities: abilityInValue, args: argsInvalue });
              }                
            }
          });
          aclStatus = checkAclAbilities({ abilities: abilityList, args: argList, any: anyModifier });
        }
      }          
    }
    return aclStatus
  }

  /**
   * Prepare ACL Check
   * 
   * @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @returns {boolean} 
   */
  const helperArgsToPrepareAcl = ({ abilities, args, any = false}) => {
    if (abilities && typeof abilities === 'string') {
      return prepareAcl({
        abilities: abilities,
        args: args,
        any: any 
      });     
    } else if (typeof abilities === 'object') {     
      return prepareAcl({
        abilities: null,
        args: abilities, // Parse abilities as args since the specified value of abilities is object/array
        any: any
      });
    }
    console.warn(':::VueSimpleACL::: Invalid ACL arguments specified.')
    return false;
  }

  /**
   * can Helper Handler
   *  @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @returns {boolean} 
   */
  const canHelperHandler = (abilities, args = null) => {
    return helperArgsToPrepareAcl({ abilities: abilities, args: args, any: false });
  }

  /**
   * can.not Helper Handler
   *  @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @returns {boolean} 
   */
  const canNotHelperHandler = (abilities, args = null) => {
    return !helperArgsToPrepareAcl({ abilities: abilities, args: args, any: false });
  }

  /**
   * can.any Helper Handler
   *  @param {string|object|array} abilities 
   * @param {object|array} args arguments
   * @returns {boolean} 
   */
  const canAnyHelperHandler = (abilities, args = null) => {
    return helperArgsToPrepareAcl({ abilities: abilities, args: args, any: true });
  }


  /**
   * Install the plugin
   * @param {object} app 
   * @param {object} options 
   * @returns {void}
   */
  const installPlugin = (app, options = {}) => {

    const isVue3 = !!app.config.globalProperties;
    let hasAsyncUser = false;

    const defaultPluginOptions = {
      user: null,
      rules: null,
      router: null,
      onDeniedRoute: '/',
      directiveName: 'can',
      helperName: '$can'
    }
    
    const pluginOptions = { ...defaultPluginOptions, ...options };
    
    // Sanitize directive name should the developer specified a custom name
    if (pluginOptions.directiveName && typeof pluginOptions.directiveName === "string") {
      if (pluginOptions.directiveName.startsWith('v-')) {
        pluginOptions.directiveName = pluginOptions.directiveName.substr(2, pluginOptions.directiveName.length);
      }      
    } 
    state.directiveName = pluginOptions.directiveName; // send to state

    // Sanitize helper name should the developer specified a custom name
    if (pluginOptions.helperName && typeof pluginOptions.helperName === "string") {
      if (pluginOptions.helperName.charAt(0) !== '$') {
        pluginOptions.helperName = '$' + pluginOptions.helperName;
      }      
    }
    
    // Register the plugin options to state
    if (typeof pluginOptions.user === 'function' && pluginOptions.user() instanceof Promise) {
      // when defined user is Asynchronous object or function
      // It requires instance of a vue-router. See below for a router hook for async promise evaluation
      hasAsyncUser = true;      
    } else {
      // when defined user is an object or function but non-Asynchronous
      registerPluginOptions(pluginOptions);
    }
    
    // directive handler function
    const directiveHandler = (el, binding, vnode) => {
      const aclAbilities = binding.arg;
      const aclArgs = binding.value;
      const aclModifiers = binding.modifiers;        
  
      const anyModifier = (aclModifiers.any) ? true : false;
      const notModifier = (aclModifiers.not) ? true : false;
      const readonlyModifier = (aclModifiers.readonly) ? true : false;
      const disableModifier = (aclModifiers.disable || aclModifiers.disabled) ? true : false;
      const hideModifier = (aclModifiers.hide || aclModifiers.hidden) ? true : false;
      
      // call to prepare ACL and check abilities
      let aclStatus = prepareAcl({ abilities: aclAbilities, args: aclArgs, any: anyModifier });
      if (aclStatus) {
        // ACL check is validm apply valid effect
    
        // reverse the valid effect
        if (notModifier) {
          el.style.display = 'none'; 
        }
      } else {
          // v-can:edit-post.disabled="post"
        if (notModifier) {
          // reverse the invalid effect
        } else {
          // apply invalid effect
          if (disableModifier) {
            el.disabled = true;
          } else if (readonlyModifier) {
            el.readOnly = true;
          } else if (hideModifier) {
            el.style.display = 'none';
          } else {
            el.style.display = 'none';
          }
        }            
      }
    }
    
    if (isVue3) { // Vue 3
      // Add a 'can' directive
      app.directive(`${pluginOptions.directiveName}`, {
        mounted(el, binding, vnode) {
          directiveHandler(el, binding, vnode);
        },
        updated(el, binding, vnode) {
          directiveHandler(el, binding, vnode);
        }
      });    
    
      // Add a global '$can' function | app.config.globalProperties.$can
      app.config.globalProperties[pluginOptions.helperName] = (abilities, args = null) => canHelperHandler(abilities, args);
      // Add a global '$can.not' function | app.config.globalProperties.$can.not
      app.config.globalProperties[pluginOptions.helperName].not = (abilities, args = null) => canNotHelperHandler(abilities, args);
      // Add a global '$can.any' function | app.config.globalProperties.$can.any
      app.config.globalProperties[pluginOptions.helperName].any = (abilities, args = null) => canAnyHelperHandler(abilities, args);
    
      // Add a '$can' provide/inject capability
      // app.provide(`${pluginOptions.helperName}`, (abilities, args = null) => canHelperHandler(abilities, args));
      // Add a '$can.not' provide/inject capability
      // app.provide(`${pluginOptions.helperName}.not`, (abilities, args = null) => canNotHelperHandler(abilities, args));
      // Add a '$can.any' provide/inject capability
      // app.provide(`${pluginOptions.helperName}.any`, (abilities, args = null) => canAnyHelperHandler(abilities, args));
    
    } else { // Vue 2
      // Add a 'can' directive
      app.directive(`${pluginOptions.directiveName}`, {
        mounted(el, binding, vnode) {
          directiveHandler(el, binding, vnode);
        },
        updated(el, binding, vnode) {
          directiveHandler(el, binding, vnode);
        }
      });  

      app.prototype.$gates = gate;
      // Add a global '$can' function | app.prototype.$can
      app.prototype[pluginOptions.helperName] = (abilities, args = null) => canHelperHandler(abilities, args);
      // Add a global '$can.not' function | app.prototype.$can.not
      app.prototype[pluginOptions.helperName].not = (abilities, args = null) => canNotHelperHandler(abilities, args);
      // Add a global '$can.any' function | app.prototype.$can.any
      app.prototype[pluginOptions.helperName].any = (abilities, args = null) => canAnyHelperHandler(abilities, args);
    }
    

    // Vue Router evaluation
    if (pluginOptions.router) {
      const routerRedirectHandler = (to, from, next, granted) => {
        if (granted) {
          next();
        } else {
          let onDeniedRoute = pluginOptions.onDeniedRoute;
          if (to.meta && to.meta.onDeniedRoute) {
            onDeniedRoute = to.meta.onDeniedRoute;
          }
          if (typeof onDeniedRoute === 'object') {
            next(onDeniedRoute)
          } else {            
            if (onDeniedRoute === '$from') {
              next(from)
            } else {
              next({ path: `${onDeniedRoute}`, replace: true })
            }            
          }
        }
      }

      const evaluateRouterAcl = (to, from, next) => {
        if (to.meta && to.meta.can) {
          const abilities = to.meta.can;
          let granted = false;
          if (typeof abilities === 'function') {              
            granted = abilities(to, from, canHelperHandler)
          } else {
            granted = canHelperHandler(abilities)
          }            
          routerRedirectHandler(to, from, next, granted);

        } else if (to.meta && to.meta.canNot) {
          const abilities = to.meta.canNot;
          let granted = false;
          if (typeof abilities === 'function') {              
            granted = abilities(to, from, canNotHelperHandler)
          } else {
            granted = canNotHelperHandler(abilities)
          }            
          routerRedirectHandler(to, from, next, granted);

        } else if (to.meta && to.meta.canAny) {
          const abilities = to.meta.canAny;
          let granted = false;
          if (typeof abilities === 'function') {              
            granted = abilities(to, from, canAnyHelperHandler)
          } else {
            granted = canAnyHelperHandler(abilities)
          }            
          routerRedirectHandler(to, from, next, granted);
        } else {
          // Proceed to request route if no can|canNot|CanAny meta is set
          next();
        }  
      }
      
      // vue-router hook
      pluginOptions.router.beforeEach((to, from, next) => { 
        if (hasAsyncUser) {  
          pluginOptions.user().then((user)=> {
            pluginOptions.user = user;
            registerPluginOptions(pluginOptions);
            evaluateRouterAcl(to, from, next);
          }).catch((err) => {
            // Abort router
            console.warn(`:::VueSimpleACL::: Error while processing/retrieving 'user' data with the Asynchronous function.`)
          });  
        } else {
          evaluateRouterAcl(to, from, next);
        }
      });
    } else { // No router
      if (hasAsyncUser) {
        console.error(`:::VueSimpleACL::: Instance of vue-router is required to define 'user' retrieved from a promise or Asynchronous function.`)
      }
    } // ./ Vue Router evaluation
  }


  /**
   * Create instance of Vue Simple ACL
   * @param {object} userDefinedOptions 
   * @returns {object}
   */
  const createAcl = (userDefinedOptions) => {
    return {
      install: (app, options = {}) => {
          return installPlugin(app, { ...options, ...userDefinedOptions });
      }
    }
  }

  /**
  * Returns the acl helper instance. Equivalent to using `$can` inside
  * templates.
  * @returns {object}
  */
  const useAcl = () => {
    let acl = {};
    acl.can = canHelperHandler;
    acl.can.not = canNotHelperHandler;
    acl.can.any = canAnyHelperHandler;
    acl.user = state.registeredUser;
    return acl;
    // return { acl, userCan, userCanNot, userCanAny, user };
  }


  return {
    installPlugin,
    createAcl,
    defineAclRules,
    useAcl    
  }
}