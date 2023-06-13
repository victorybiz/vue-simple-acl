import { computed, reactive } from 'vue';

import { Ability, AbilityArgs, AnyFunction, PluginOption, State, User } from '../types';
import { PluginOptionWithDefaults, AbilitiesEvaluationProps, Acl, AsyncUser, RuleSetter } from '../types/acl';
import { capitalize, getFunctionArgsNames } from './utils';

// plugin global state
const state = reactive({
  registeredUser: {},
  registeredRules: {},
  options: {},
} as State<unknown>);

/**
 * Register plugin options to state
 * @param pluginOptions 
 * @return void
 */
const registerPluginOptions = <U = User>(pluginOptions: PluginOptionWithDefaults<U>): void => {
  // Init and set user to state
  if (hasAsyncUser(pluginOptions.user)) {
    state.registeredUser = pluginOptions.user();
  } else {
    const user: any = pluginOptions.user;
    state.registeredUser = user;
  }   
  // Run and init the defined rules
  if (pluginOptions.rules && typeof pluginOptions.rules === "function") {
    pluginOptions.rules();
  }
  // Set other user defined plugins to state
  state.options = pluginOptions;
}


/**
 * Add an ability and its callback to rules state
 * @param ability
 * @param callback 
 * @return void 
 */
const addAclAbility = (ability: string, callback: AnyFunction): void => {
  if (!Object.prototype.hasOwnProperty.call(state.registeredRules, ability)) {
    state.registeredRules[ability] = callback;
  } else {
    console.warn(`:::VueSimpleACL::: Duplicate ACL Rule '${ability}' defined. Only the first defined rule will be evaluated.`)
  }
}

/**
 * Set an ACL Rule
 * @param abilities 
 * @param callback 
 * @return void
 */
const setRule = (abilities: Ability, callback: AnyFunction): void => {
  if (typeof abilities === "string") {
    addAclAbility(abilities, callback);
  } else if (typeof abilities === "object" && Array.isArray(abilities)) {     
    Object.values(abilities).forEach((ability) => {
      addAclAbility(ability, callback);
    });
  }
};

/**
 * Evaluate ability check
 * @param ability
 * @param abilityCallback
 * @param args arguments
 * @return boolean
 */
const evaluateAbilityCallback = (abilityCallback: any, ability: Ability, args?: AbilityArgs): boolean => {
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
    const callbackArgsNames = getFunctionArgsNames(abilityCallback);
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
 * @param object 
 * @return boolean
 */
const checkAclAbilities = ({ abilities, args, any = false }: AbilitiesEvaluationProps): boolean => {
  if (abilities && typeof abilities === 'string') {
    if (Object.prototype.hasOwnProperty.call(state.registeredRules, abilities)) {
      const callback = state.registeredRules[abilities];
      return evaluateAbilityCallback(callback, abilities, args);
    }
  } else if (typeof abilities === 'object' && Array.isArray(abilities)) {
    let checkStatus = false;
    let callbackResponse = false;
    let counter = 0;
    let validCount = 0;
    abilities.forEach((ability) => {
      if (Object.prototype.hasOwnProperty.call(state.registeredRules, ability.abilities)) {
        const callback = state.registeredRules[ability.abilities];
        callbackResponse =  evaluateAbilityCallback(callback, ability.abilities, ability.args);
        if (callbackResponse) {
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
 * @param object
 * @return boolean 
 */
const prepareAcl = ({ abilities, args, any = false }: AbilitiesEvaluationProps): boolean => {
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
      aclStatus = checkAclAbilities({ abilities: aclAbilities} );
    }       
  } else {
    if (aclArgs && typeof aclArgs === 'string') {
      // v-can="'create-post'" OR $can('create-post')
      aclStatus = checkAclAbilities({ abilities: aclArgs});
    } else if (aclArgs && aclArgs !== null && typeof aclArgs === 'object') {
      // v-can="['edit-post', post]" OR $can(['edit-post', post])
      const argsCount = (Array.isArray(aclArgs)) ? aclArgs.length : Object.keys(aclArgs).length;        
      if (argsCount === 2 && typeof aclArgs[0] === 'string' && typeof aclArgs[1] === 'object' && !Array.isArray(aclArgs[1])) {
        aclStatus = checkAclAbilities({ abilities: aclArgs[0], args: aclArgs[1] });          
      } else {
        // v-can="['create-post', ['edit-post', post]]" OR $can(['create-post', ['edit-post', post]])
        const abilityList: any[] = [];
        const argList: any[] = [];
        aclArgs.forEach((ability) => {
          if (ability && typeof ability === 'string') {
            // ...=['create-post', ...]
            abilityList.push({ abilities: ability });

          } else if (ability && typeof ability === 'object') {
            // ...=[['edit-post', post], ...]
            let abilityInValue: string | null = null;
            const argsInvalue: any[] = [];
            ability.forEach((nextedAbility: any) => {
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
 * Parse helper arguments to Prepare ACL
 * @param object
 * @return {boolean} 
 */
const helperArgsToPrepareAcl = ({ abilities, args, any = false }: AbilitiesEvaluationProps): boolean => {
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
 * @param abilities 
 * @param args arguments
 * @return boolean 
 */
const canHelperHandler = (abilities: Ability, args?: AbilityArgs): boolean => {
  return helperArgsToPrepareAcl({ abilities: abilities, args: args, any: false });
}

/**
 * can.not Helper Handler
 * @param abilities 
 * @param args arguments
 * @return boolean
 */
const notCanHelperHandler = (abilities: Ability, args?: AbilityArgs): boolean => {
  return !helperArgsToPrepareAcl({ abilities: abilities, args: args, any: false });
}

/**
 * can.any Helper Handler
 * @param abilities 
 * @param args arguments
 * @return boolean
 */
const anyCanHelperHandler = (abilities: Ability, args?: AbilityArgs): boolean => {
  return helperArgsToPrepareAcl({ abilities: abilities, args: args, any: true });
}

/**
 * Checks if the user has an async getter
 * @param  {U|AsyncUser<U>} user
 * @returns boolean
 */
const hasAsyncUser = <U = User>(user: U | AsyncUser<U>): user is AsyncUser<U> => {
  return typeof user === 'function' && (user as any)() instanceof Promise;
};


/**
 * Install the plugin
 * @param app 
 * @param options 
 * @return void
 */
export const installPlugin = <U = User>(app: any, options?: PluginOption<U>) => {

  const isVue3 = !!app.config.globalProperties;
  const defaultPluginOptions: PluginOptionWithDefaults<U> = {
    user: Object.create(null),
    rules: null,
    router: null,
    onDeniedRoute: '/',
    directiveName: 'can',
    helperName: '$can',
    enableSematicAlias: true
  }
  const pluginOptions: PluginOptionWithDefaults<U> = { ...defaultPluginOptions, ...options };
  
  // Sanitize directive name should the developer specified a custom name
  if (pluginOptions.directiveName && typeof pluginOptions.directiveName === "string") {
    if (pluginOptions.directiveName.startsWith('v-')) {
      pluginOptions.directiveName = pluginOptions.directiveName.substring(2, pluginOptions.directiveName.length);
    }      
  }

  // Sanitize helper name should the developer specified a custom name
  if (pluginOptions.helperName && typeof pluginOptions.helperName === "string") {
    if (pluginOptions.helperName.charAt(0) !== '$') {
      pluginOptions.helperName = '$' + pluginOptions.helperName;
    }      
  }
  
  // Register the plugin options to state
  if (!hasAsyncUser(pluginOptions.user)) {
    // when defined user is an object or function but non-Asynchronous
    registerPluginOptions(pluginOptions);
  }
  
  // directive handler function
  const directiveHandler = (el: any, binding: any) => {
    const aclAbilities = binding.arg;
    const aclArgs = binding.value;
    const aclModifiers = binding.modifiers;        

    const anyModifier = (aclModifiers.any) ? true : false;
    const notModifier = (aclModifiers.not) ? true : false;
    const readonlyModifier = (aclModifiers.readonly) ? true : false;
    const disableModifier = (aclModifiers.disable || aclModifiers.disabled) ? true : false;
    const hideModifier = (aclModifiers.hide || aclModifiers.hidden) ? true : false;
    
    // call to prepare ACL and check abilities
    const aclStatus = prepareAcl({ abilities: aclAbilities, args: aclArgs, any: anyModifier });
    if (aclStatus) {
      // ACL check is validm apply valid effect
  
      // reverse the valid effect
      if (notModifier) {
        el.remove()
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
          el.remove()
        } else {
          el.remove()
        }
      }            
    }
  }

  const registerDirective = (app: any, name: string, isVue3: boolean) => {
    if (isVue3) {
      app.directive(`${name}`, {
        mounted(el: any, binding: any) {
          directiveHandler(el, binding);
        },
        updated(el: any, binding: any) {
          directiveHandler(el, binding);
        }
      });
    } else {
      app.directive(`${name}`, {
        inserted(el: any, binding: any) {
          directiveHandler(el, binding);
        },
        updated(el: any, binding: any) {
          directiveHandler(el, binding);
        }
      });
    }
  }

  const registerHelper = (app: any, name: string, isVue3: boolean, isAlias: boolean) => {
    // Add a global '$can' or '$anycustomname' function | app.config.globalProperties.$can
    // Add a global '$can.not' or '$anycustomname.not' function | app.config.globalProperties.$can.not
    // Add a global '$can.any' or '$anycustomname.any' function | app.config.globalProperties.$can.any
    // add a global '$acl.can'  or '$acl.anyCan', etc
    if (isVue3) { // Vue 3
      if (isAlias) {
        if (!app.config.globalProperties.$acl) {
          app.config.globalProperties.$acl = {};
        }
        app.config.globalProperties.$acl[name] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.config.globalProperties.$acl[`all${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.config.globalProperties.$acl[`not${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => notCanHelperHandler(abilities, args);
        app.config.globalProperties.$acl[`any${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => anyCanHelperHandler(abilities, args);
      } else {
        app.config.globalProperties[name] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.config.globalProperties[name].all = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.config.globalProperties[name].not = (abilities: Ability, args?: AbilityArgs) => notCanHelperHandler(abilities, args);
        app.config.globalProperties[name].any = (abilities: Ability, args?: AbilityArgs) => anyCanHelperHandler(abilities, args);
      }        
    } else { // Vue 2        
      if (isAlias) {
        if (!app.prototype.$acl) {
          app.prototype.$acl = {};
        }
        app.prototype.$acl[name] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.prototype.$acl[`all${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.prototype.$acl[`not${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => notCanHelperHandler(abilities, args);
        app.prototype.$acl[`any${capitalize(name)}`] = (abilities: Ability, args?: AbilityArgs) => anyCanHelperHandler(abilities, args);
      } else {
        app.prototype[name] = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.prototype[name].all = (abilities: Ability, args?: AbilityArgs) => canHelperHandler(abilities, args);
        app.prototype[name].not = (abilities: Ability, args?: AbilityArgs) => notCanHelperHandler(abilities, args);
        app.prototype[name].any = (abilities: Ability, args?: AbilityArgs) => anyCanHelperHandler(abilities, args);
      }
    }
  }

  // DIRECTIVES
  registerDirective(app, `${pluginOptions.directiveName}`, isVue3);
  // DIRECTIVE Sematic Aliases
  if (pluginOptions.enableSematicAlias) {
    registerDirective(app, 'permission', isVue3);
    registerDirective(app, 'permissions', isVue3);
    registerDirective(app, 'role', isVue3);
    registerDirective(app, 'roles', isVue3);
    registerDirective(app, 'role-or-permission', isVue3);
    registerDirective(app, 'role-or-permissions', isVue3);
  }

  // HELPER FUNCTION / METHOD
  registerHelper(app, `${pluginOptions.helperName}`, isVue3, false);
  // Helper Sematic Aliases
  if (pluginOptions.enableSematicAlias) {
    registerHelper(app, 'can', isVue3, true);
    registerHelper(app, 'permission', isVue3, true);
    registerHelper(app, 'permissions', isVue3, true);
    registerHelper(app, 'role', isVue3, true);
    registerHelper(app, 'roles', isVue3, true);
    registerHelper(app, 'roleOrPermission', isVue3, true);
    registerHelper(app, 'roleOrPermissions', isVue3, true);
    // Add user data to the global variable as property     
    if (isVue3) {
      if (!app.config.globalProperties.$acl) {
        app.config.globalProperties.$acl = {};
      }
      app.config.globalProperties.$acl.user = computed(() => state.registeredUser).value;
      app.config.globalProperties.$acl.getUser = () => state.registeredUser;
    } else {
      if (!app.prototype.$acl) {
        app.prototype.$acl = {};
      }
      app.prototype.$acl.user = computed(() => state.registeredUser).value;
      app.prototype.$acl.getUser = () => state.registeredUser;
    }    
  }
  


  // VUE ROUTER MIDDLEWARE EVALUATIONS
  if (pluginOptions.router) {

    const routerRedirectHandler = (to: any, from: any, next: any, granted: any) => {
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

    const evaluateRouterAcl = (to: any, from: any, next: any) => {
      if (to.meta && (to.meta.can || to.meta.permission || to.meta.role || to.meta.roleOrPermission)) {
        const abilities = (to.meta.can || to.meta.permission || to.meta.role || to.meta.roleOrPermission);
        let granted = false;
        if (typeof abilities === 'function') {      
          const funcArgs = getFunctionArgsNames(abilities); 
          if (Array.isArray(funcArgs) && funcArgs.length === 4) {
            granted = abilities(to, from, canHelperHandler, state.registeredUser);
          } else {
            granted = abilities(to, from, canHelperHandler);
          }          
        } else {
          granted = canHelperHandler(abilities)
        }            
        routerRedirectHandler(to, from, next, granted);

      } else if (to.meta && (to.meta.canAll || to.meta.allCan || to.meta.allPermission || to.meta.allRole || to.meta.allRoleOrPermission)) {
        const abilities = (to.meta.canAll || to.meta.allCan || to.meta.allPermission || to.meta.allRole || to.meta.allRoleOrPermission);
        let granted = false;
        if (typeof abilities === 'function') {              
          const funcArgs = getFunctionArgsNames(abilities); 
          if (Array.isArray(funcArgs) && funcArgs.length === 4) {
            granted = abilities(to, from, canHelperHandler, state.registeredUser);
          } else {
            granted = abilities(to, from, canHelperHandler);
          } 
        } else {
          granted = canHelperHandler(abilities)
        }            
        routerRedirectHandler(to, from, next, granted);

      } else if (to.meta && (to.meta.cannot || to.meta.canNot || to.meta.notCan || to.meta.notPermission || to.meta.notRole || to.meta.notRoleOrPermission)) {
        const abilities = (to.meta.cannot || to.meta.canNot || to.meta.notCan || to.meta.notPermission || to.meta.notRole || to.meta.notRoleOrPermission);
        let granted = false;
        if (typeof abilities === 'function') {              
          const funcArgs = getFunctionArgsNames(abilities); 
          if (Array.isArray(funcArgs) && funcArgs.length === 4) {
            granted = abilities(to, from, notCanHelperHandler, state.registeredUser);
          } else {
            granted = abilities(to, from, notCanHelperHandler);
          } 
        } else {
          granted = notCanHelperHandler(abilities)
        }            
        routerRedirectHandler(to, from, next, granted);

      } else if (to.meta && (to.meta.canAny || to.meta.anyCan || to.meta.anyPermission || to.meta.anyRole|| to.meta.anyRoleOrPermission)) {
        const abilities = (to.meta.canAny || to.meta.anyCan || to.meta.anyPermission || to.meta.anyRole|| to.meta.anyRoleOrPermission);
        let granted = false;
        if (typeof abilities === 'function') {              
          const funcArgs = getFunctionArgsNames(abilities); 
          if (Array.isArray(funcArgs) && funcArgs.length === 4) {
            granted = abilities(to, from, anyCanHelperHandler, state.registeredUser);
          } else {
            granted = abilities(to, from, anyCanHelperHandler);
          } 
        } else {
          granted = anyCanHelperHandler(abilities);
        }            
        routerRedirectHandler(to, from, next, granted);
      } else {
        // Proceed to request route if no can|canNot|CanAny meta is set
        next();
      }  
    }
    
    // vue-router hook
    pluginOptions.router.beforeEach((to: any, from: any, next: any) => { 
      if (hasAsyncUser(pluginOptions.user)) {  
        pluginOptions.user().then(user => {
          pluginOptions.user = user;
          registerPluginOptions(pluginOptions);
          evaluateRouterAcl(to, from, next);
        }).catch(() => {
          // Abort router
          console.warn(`:::VueSimpleACL::: Error while processing/retrieving 'user' data with the Asynchronous function.`)
        });  
      } else {
        evaluateRouterAcl(to, from, next);
      }
    });
  } else { // No router
    if (hasAsyncUser(pluginOptions.user)) {
      console.error(`:::VueSimpleACL::: Instance of vue-router is required to define 'user' retrieved from a promise or Asynchronous function.`)
    }
  } // ./ Vue Router evaluation
}


/**
 * Create instance of Vue Simple ACL
 * @param userDefinedOptions 
 * @return object
 */
export const createAcl = <U = User>(userDefinedOptions: PluginOption<U>): any => {
  return {
    install: (app: any, options: any = {}) => {
      installPlugin(app, { ...options, ...userDefinedOptions });
    }
  }
}

/**
* Define ACL Rules
* @param aclRulesCallback
* @return void
*/
export const defineAclRules = <U = User>(aclRulesCallback: (setter: RuleSetter<U>) => void): void => {
  if (typeof aclRulesCallback === "function") {
    aclRulesCallback(setRule);
  }
};

/**
* Returns the acl helper instance. Equivalent to using `$can` inside templates.
* @return object
*/
export const useAcl = <U = User>(): Acl<U> => {
  const acl: any = {};
  acl.user = computed(() => state.registeredUser).value;
  acl.getUser = () => state.registeredUser;
  // 
  acl.can = canHelperHandler;
  acl.can.not = notCanHelperHandler;
  acl.can.any = anyCanHelperHandler;
  // 
  acl.notCan = notCanHelperHandler;
  acl.canNot = notCanHelperHandler;
  acl.cannot = notCanHelperHandler;
  acl.anyCan = anyCanHelperHandler;
  // 
  acl.permission = canHelperHandler;
  acl.allPermission = canHelperHandler;
  acl.notPermission = notCanHelperHandler;
  acl.anyPermission = anyCanHelperHandler;
  acl.permission.not = notCanHelperHandler;
  acl.permission.any = anyCanHelperHandler;
  // 
  acl.role = canHelperHandler;
  acl.allRole = canHelperHandler;
  acl.notRole = notCanHelperHandler;
  acl.anyRole = anyCanHelperHandler;
  acl.role.not = notCanHelperHandler;
  acl.role.any = anyCanHelperHandler;
  // 
  acl.roleOrPermission = canHelperHandler;
  acl.allRoleOrPermission = canHelperHandler;
  acl.notRoleOrPermission = notCanHelperHandler;
  acl.anyRoleOrPermission = anyCanHelperHandler;
  acl.roleOrPermission.not = notCanHelperHandler;
  acl.roleOrPermission.any = anyCanHelperHandler;
  return reactive(acl);
}
