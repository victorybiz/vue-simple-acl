
/**
 * Get function arguments names
 * @param func 
 * @returns array | null
 */
export const getFunctionArgsNames = (func: Function): any[] | null => {
  let StrCallbackArgs = null;

  const regex = /\(([a-z0-9 ,$_\+\*\-\/]+)\)/im;
  const funcStr = func.toString();
  let foundResult = funcStr.match(regex)
  
  if (foundResult && Array.isArray(foundResult) && foundResult[0]) {
    let funcArgs = foundResult[0];
    funcArgs = funcArgs.replace(/\(|\)|[ ]/g, ''); // Remove spaces, (, and ) characters
    let funcArgsArr = funcArgs.split(','); // Split the string into array
    if (funcArgsArr.length > 0) {
      StrCallbackArgs = funcArgsArr
    }     
  }
  return StrCallbackArgs
}

/**
 * Capitalize the first letter of a string
 * @param s String
 * @returns string
 */
export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
