// type User with properties and callable/call signature
type User = {
  [key: string]: any,
  (): any, // callable / call Signature
}

export interface PluginOption {
  user:  User | Function,
  rules: Function | null
  router: any,
  onDeniedRoute: string,
  directiveName: string,
  helperName: string
  enableSematicAlias: boolean
}

export interface State {
  registeredUser: { [key: string]: any },
  registeredRules: { [key: string]: any },
  options: PluginOption,
}

export type Ability = string | any[] | null;
export type AbilityArgs = string | any[] | null;

export type AbilitiesEvaluationProps = { abilities?: Ability, args?: AbilityArgs, any?: boolean }
