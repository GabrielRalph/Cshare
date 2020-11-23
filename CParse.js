

class CParse{
  constructor(){

  }

  static parseString(string){
    let includes = this.getIncludes(string);
    console.log(includes);
    return includes
  }

  static getIncludes(string){
    let includes = [];
    string = string.replace(/^\s*#include\s*([<"]\s*\w\s*[>"])/gm, (a, b) => {
      includes.push({
        type: '#include',
        value: b
      })
      return ''
    })
    return {
      res: includes,
      newString: string
    }
  }
}
