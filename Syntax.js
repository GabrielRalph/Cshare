class Syntax extends Highlights{

  build(){
    if (!(this instanceof HTMLPreElement)) throw ''+ new PlusError("DoxyList must be a HTMLTableElement");
    this.icon = 0;
    this.observer = new MutationObserver(() => {this.onChange()})
    this.observer.observe(this, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    })
    this.counter = 0;
  }

  onChange(){
    this.counter++;
    if(this.counter < 20) return;
    this.counter = 0;
    this.pre = this.innerHTML;
  }

  highlighter(){
    console.log(('x'));
    this.highlightRegex(/\/\/.*/g, 0, "comments");
    this.highlightRegex(/\/\*([^\\]*?)\*\//g, 0, "comments");
    this.highlightRegex(/'\w'/g, 0, "chars");
    this.highlightRegex(/\"[^"]*\"/g, 0, "strings");
    this.highlightRegex(/\W(\d+)\W/g, 1, "digits");

    // this.highlightKeywords(this.doxygen.keyWords, 'key-words');
    // this.highlightKeywords(this.doxygen.types, 'types');
    // this.highlightKeywords(this.doxygen.typedefs, 'typedefs');
    // this.highlightKeywords(Object.keys(this.doxygen.globals), 'globals');
    // this.highlightKeywords(Object.keys(this.doxygen.defines), 'defines');
    this.highlightKeywords(['#define'], 'defines-title');
    // if (this.fbody && this.fbody.comments && this.fbody.comments.params) this.highlightKeywords(Object.keys(this.fbody.comments.params), 'param')

    this.highlightRegex(/(\.|->)(\w+)\W/g, 2, 'field');
    this.highlightRegex(/\W(\w+)(\.|->)\w/g, 1, 'before-field');
    this.highlightRegex(/\W(\w+)[(][^)]*[)];/g, 1, 'function-use');
    this.highlightRegex(/^\s*\w*[*\s]*(\w*)[(]/gm, 1, "function-names");
  }


}
