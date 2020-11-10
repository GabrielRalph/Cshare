class DoxyPre extends Highlights{

  build(){
    if (!(this instanceof HTMLPreElement)) throw ''+ new PlusError("DoxyList must be a HTMLTableElement");
    this.icon = 0;
  }

  set doxygen(doxygen){
    this._doxygen = doxygen;
  }

  get doxygen(){
    if (this._doxygen) return this._doxygen;
    return null;
  }

  highlighter(){
    this.highlightRegex(/\/\/.*/g, 0, "comments");
    this.highlightRegex(/\/\*([^\\]*?)\*\//g, 0, "comments");
    this.highlightRegex(/'\w'/g, 0, "chars");
    this.highlightRegex(/\"[^"]*\"/g, 0, "strings");
    this.highlightRegex(/\W(\d+)\W/g, 1, "digits");

    this.highlightKeywords(this.doxygen.keyWords, 'key-words');
    this.highlightKeywords(this.doxygen.types, 'types');
    this.highlightKeywords(this.doxygen.typedefs, 'typedefs');
    this.highlightKeywords(Object.keys(this.doxygen.globals), 'globals');
    this.highlightKeywords(Object.keys(this.doxygen.defines), 'defines');
    this.highlightKeywords(['#define'], 'defines-title');
    if (this.fbody && this.fbody.comments && this.fbody.comments.params) this.highlightKeywords(Object.keys(this.fbody.comments.params), 'param')

    this.highlightRegex(/(\.|->)(\w+)\W/g, 2, 'field');
    this.highlightRegex(/\W(\w+)(\.|->)\w/g, 1, 'before-field');
    this.highlightRegex(/\W(\w+)[(][^)]*[)];/g, 1, 'function-use');
    this.highlightRegex(/^\s*\w*[*\s]*(\w*)[(]/gm, 1, "function-names");
  }

  clickHandler(){
    if (!this.fbody) return;
    this.icon++;
    if (this.icon == 3) this.icon = 0;

    if (this.icon == 0){
      this.pre = this.fhead
      this.arrow.tip.props = {class: "button down"}
    }
    if (this.icon == 1){
      this.pre = this.fbody.body;
      this.arrow.tip.props = {class: "button up"}

    }
    if (this.icon == 2){
      if (!this.fbody.comments) {
        this.clickHandler();
        return;
      }

      let body;
      if (this.fbody.comments.body) body = this.fbody.comments.body + '\n';
      let params = this.fbody.comments.params;
      if (params) {
        for (var name in params){
          body += '\n' + params[name];
        }
      }
      if (this.fbody.comments.return) body += '\n\n' + this.fbody.comments.return;
      this.pre = body;
    }
  }

  set fbody(body){
    // if (typeof bodyString !== 'string') return;
    this._fbody = body;
  }
  get fbody(){
    return this._fbody;
  }

  set fhead(titleString){
    if (typeof titleString !== 'string') return;
    this._fhead = titleString;
    this.pre = this.fhead;
  }
  get fhead(){
    return this._fhead;
  }

  get arrow(){
    return this._arrow;
  }
  set arrow(arrow){
    if(!(arrow instanceof HTMLTableCellElement) ) return;
    this._arrow = arrow;
    this._arrow.tip = this._arrow.firstChild;
    this._arrow.tip.props = {class: 'button ' + (this.icon == 0 ? 'down' : 'up')}
    this._arrow.onclick = () => {this.clickHandler()}
  }
}
