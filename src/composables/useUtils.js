export default function useUtils() {

  /**
   * Get function arguments names
   * @param {function|string} func 
   * @returns {array|null}
   */
   const getFunctionArgsNames = (func) => {
    let StrCallbackArgs = null;

    const regex = /\(([a-z0-9 ,$_\+\*\-\/]+)\)/im;
    const funcStr = func.toString();
    let foundResult = funcStr.match(regex)
    
    if (foundResult && Array.isArray(foundResult) && foundResult[0]) {
      let funcArgs = foundResult[0];
      funcArgs = funcArgs.replace(/\(|\)|[ ]/g, ''); // Remove spaces, (, and ) characters
      funcArgs = funcArgs.split(','); // Split the string into array
      if (funcArgs.length > 0) {
        StrCallbackArgs = funcArgs
      }     
    }
    return StrCallbackArgs
  }

  return {
    getFunctionArgsNames
  }
}