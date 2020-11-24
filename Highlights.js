class Syntax{
  constructor(){
    this._keyword_map = {};
    this._highlighters = [];
  }

  makeHighlighter(element){
    let highlighter = new Highlighter(element);
    highlighter.syntax = this;
    this.addHighlighter(highlighter);
    return highlighter;
  }

  /** add, adds key names to the key name map.  */
  add(type, name){
    if (typeof type != 'string') return;
    this._keyword_map[type] = (type in this._keyword_map) ? this._keyword_map[type] : [];

    //If name is an array then check it for strings.
    if (name instanceof Array){
      name.forEach((singleName) => {
        if (typeof singleName == 'string'){
          this._keyword_map[type].push(singleName);
        }
      });
      this.update();

    //Otherwise if it is a string push it to the map.
    }else if(typeof name == 'string'){
      this._keyword_map[type].push(name);
      this.update();
    }
  }

  /** search for every keyword and call a callback function */
  forEachKeyword(callback){
    if ( callback instanceof Function ){
      for (var type in this._keyword_map){
        for (var i = 0; i < this._keyword_map[type].length; i++){
          callback(type, this._keyword_map[type][i]);
        }
      }
    }
  }


  /** addHighlighter adds a Highlighter to the highlighters list */
  addHighlighter(highlighter){
    if (!(highlighter instanceof Highlighter)) return;
    this._highlighters.push(highlighter);
    highlighter.syntax = this;
  }


  /** update highlighter */
  update(){
    this._highlighters.forEach((highlighter) => {
      highlighter.update();
    });
  }
}

class CSyntax extends Syntax{
  constructor(){
    super();
    let types = ["char", "const", "double", "enum", "float", "int", "long", "short", "signed", "static", "struct", "typedef", "union", "unsigned", "void", "volatile"];
    let keyWords = ["auto", "break", "case", "continue", "default", "do", "else", "extern", "for", "goto", "if", "register", "return", "sizeof", "switch", "while"];
    this.add('type', types);
    this.add('key', keyWords);
    this.add('macros', '#define');
    this.add('includes', '#include');
    this.add('pragmas', '#pragma');
  }

  highlight(highlighter){
    highlighter.highlightRegex(/\/\/[\n]*/g, 'comments');
    highlighter.highlightRegex(/\/\/.*/g, 0, "comments");
    highlighter.highlightRegex(/\/\*([^\\]*?)\*\//g, 0, "comments");
    highlighter.highlightRegex(/'\w'/g, 0, "chars");
    highlighter.highlightRegex(/\"[^"]*\"/g, 0, "strings");
    highlighter.highlightRegex(/[^\w\#](\d+)\W/g, 1, "digits");
  }
}

class Highlighter extends SvgPlus{
  build(){
    this.clearHighlights();
  }

  set syntax(syntax){
    if (syntax instanceof Syntax){
      this._syntax = syntax;
    }
  }

  get syntax(){
    return this._syntax;
  }

  highlightSyntax(){
    if (this.syntax){

      this.syntax.forEachKeyword((type, name) => {
        let regex = new RegExp(`\\W(${name})\\W`, 'g');
        this.highlightRegex(regex, 1, type);

        regex = new RegExp(`^(${name})\\W`, 'g');
        this.highlightRegex(regex, 1, type);
      });
    }
  }

  clearHighlights(){
    this.highlights = [];
  }

  get html(){
    return this._html;
  }

  set html(string){
    if (typeof string === 'string') {
      this._html = string;
      this.update();
    }
  }

  update(){
    this.clearHighlights();
    this.syntax.highlight(this);
    this.highlightSyntax();
    this.innerHTML = this.toString();
  }

  highlightRegex(regex, group_num, elClass){
    if (!(regex instanceof RegExp)) return;
    if (group_num < 0) return;

    const matches = this.html.matchAll(regex);
    for (const match of matches){
      if (match[group_num] && match[group_num].length !== 0){
        let s_index = match.index + match[0].indexOf(match[group_num]);
        let e_index = s_index + match[group_num].length;
        try{
          this.addHighlight(s_index, e_index, elClass);
        }catch(e){
        }
      }
    }
  }

  _sort(){
    this.highlights.sort((a, b) => {
      if (a.start > b.start){
        return 1;
      }else if(b.start > a.start){
        return -1;
      }else{
        return 0;
      }
    })
  }

  _search(highlight){
    if (typeof highlight !== 'object') return false;

    let start = highlight.start;
    let end = highlight.end;

    if (this.highlights.length == 0) return true;
    if (this.highlights.length == 1) return start > this.highlights[0].end || end < this.highlights[0].start;

    this._sort();
    let n = this.highlights.length;
    if (end < this.highlights[0].start) return true;
    if (start > this.highlights[n - 1].end) return true;

    let binarySearch = (s, e) => {
      if (s == e){
        return start > this.highlights[s].end || end < this.highlights[s].start;
      }else if(s > e){
        return end < this.highlights[s].start && start > this.highlights[e].end;
      }

      let m = Math.round((e + s)/2);
      let mid = this.highlights[m];
      if (start > mid.end) return binarySearch(m + 1, e);
      if (end < mid.start) return binarySearch(s, m - 1);
      return false;
    }
    return binarySearch(0, this.highlights.length -1);
  }

  addHighlight(startIndx, endIndx, elClass){
    if (typeof startIndx !== 'number' || Number.isNaN(startIndx)) throw '' + new PlusError('Highlight start index not a number');
    if (typeof endIndx !== 'number' || Number.isNaN(endIndx)) throw '' + new PlusError('Highlight end index not a number');

    if (startIndx < 0 || startIndx > endIndx || startIndx >= this.html.length) throw '' + new PlusError('Highlight start index out of bounds');
    if (endIndx < 0 || endIndx == startIndx || endIndx >= this.html.length) throw '' + new PlusError('Highlight end index out of bounds');

    var highlight = {start: startIndx, end: endIndx, elClass:elClass};
    if (!this._search(highlight)) throw '' + new PlusError(`text is already being highlight [${startIndx}, ${endIndx}]`)
    this.highlights.push(highlight);

    this.innerHTML = this.toString();
  }

  toString(){
    this._sort();
    let newString = this.html;

    for (var i = this.highlights.length - 1; i >= 0; i--){
      let highlight = this.highlights[i];
      let left = newString.slice(0, highlight.start);
      let mid = newString.slice(highlight.start, highlight.end);
      let right = newString.slice(highlight.end, newString.length);

      newString = `${left}<b class = "${highlight.elClass}">${mid}</b>${right}`
    }
    return newString
  }
}
