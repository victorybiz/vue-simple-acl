import { ComputedRef } from "@vue/reactivity";

// type User with properties and callable/call signature
export type User = {
  [key: string]: any,
  (): any, // callable / call Signature
}

export type AsyncUser<U> = () => Promise<U>;

export interface PluginOption<U = User> {
  user?:  U | (() => Promise<U>);
  rules?: Function | null;
  router?: any;
  onDeniedRoute?: string;
  directiveName?: string;
  helperName?: string;
  enableSematicAlias?: boolean;
}

export interface PluginOptionWithDefaults<U = User> {
  user:  U | (() => Promise<U>);
  rules: Function | null;
  router: any;
  onDeniedRoute: string;
  directiveName: string;
  helperName: string;
  enableSematicAlias: boolean;
}

export interface State<U = User> {
  registeredUser: { [key: string]: any };
  registeredRules: { [key: string]: any };
  options: PluginOptionWithDefaults<U>;
}

export type Ability = string | any[] | null;
export type AbilityArgs = string | any[] | null;

export type AbilitiesEvaluationProps = { abilities?: Ability, args?: AbilityArgs, any?: boolean };
export type AbilitiesEvaluation = (abilities: Ability, args?: AbilityArgs) => boolean;
export type PolicyEvaluation<U = User> = (user: U, ...params: any[]) => boolean;
export type RuleSetter<U = User> = (abilities: Ability, callback: PolicyEvaluation<U>) => void;
export type AnyFunction = (...args: any[]) => any;

export interface Acl<User> {
  user: ComputedRef<User>;
  getUser: () => User;
  can: {
    (abilities: Ability, args?: AbilityArgs): boolean;
    not: AbilitiesEvaluation;
    any: AbilitiesEvaluation;
  }
  notCan: AbilitiesEvaluation;
  canNot: AbilitiesEvaluation;
  cannot: AbilitiesEvaluation;
  anyCan: AbilitiesEvaluation;
  allPermission: AbilitiesEvaluation;
  notPermission: AbilitiesEvaluation;
  anyPermission: AbilitiesEvaluation;
  permission: {
    (abilities: Ability, args?: AbilityArgs): boolean;
    not: AbilitiesEvaluation;
    any: AbilitiesEvaluation;
  }
  role: {
    (abilities: Ability, args?: AbilityArgs): boolean;
    not: AbilitiesEvaluation;
    any: AbilitiesEvaluation;
  }
  allRole: AbilitiesEvaluation;
  notRole: AbilitiesEvaluation;
  anyRole: AbilitiesEvaluation;
  roleOrPermission: {
    (abilities: Ability, args?: AbilityArgs): boolean;
    not: AbilitiesEvaluation;
    any: AbilitiesEvaluation;
  }
  allRoleOrPermission: AbilitiesEvaluation;
  notRoleOrPermission: AbilitiesEvaluation;
  anyRoleOrPermission: AbilitiesEvaluation;
}


export declare const createAcl: <U = User>(userDefinedOptions: PluginOption<U>) => any;
export declare const defineAclRules: <U = User>(aclRulesCallback: (setter: RuleSetter<U>) => void) => void;
export declare const useAcl: <U = User>() => Acl<U>;

