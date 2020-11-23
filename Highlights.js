class Highlighter{
  types = ["char", "const", "double", "enum", "float", "int", "long", "short", "signed", "static", "struct", "typedef", "union", "unsigned", "void", "volatile"];
  keyWords = ["auto", "break", "case", "continue", "default", "do", "else", "extern", "for", "goto", "if", "register", "return", "sizeof", "switch", "while"];
  constructor(){
    this._customTypes = [];
    this._customFunctions = [];
    this._globalVariables = [];
    this._highlights = [];
  }



  get customTypes(){
    return this._customTypes;
  }
  get customFunctions(){
    return this._customFunctions;
  }
  get globalVariables(){
    return this._globalVariables;
  }

  addHighlight(highlight){
    this._highlights.push(highlight);
  }

  addCustomType(type){
    if (typeof type !== 'string') return;
    this._customTypes.push(type);
    this.update();
  }

  addCustomFunction(func){
    if (typeof func !== 'string') return;
    this._customFunctions.push(func);
    this.update();
  }

  addCustomVariable(variable){
    if (typeof variable !== 'string') return;
    this._globalVariables.push(variable);
    this.update();
  }

  update(){
    this._highlights.forEach((highlight) => {
      if (highlight && highlight.update instanceof Function) highlight.update();
    });
  }
}

var HIGHLIGHTER = new Highlighter();

class Highlights extends SvgPlus{
  build(){
    HIGHLIGHTER.addHighlight(this);
  }
  get pre(){
    return this._pre;
  }

  highlighter(){
      this.highlightKeywords(HIGHLIGHTER.types, 'type');
      this.highlightKeywords(HIGHLIGHTER.keyWords, 'keyword');
      this.highlightKeywords(HIGHLIGHTER.customTypes, 'custom-type');
      this.highlightKeywords(["#define"], 'macros');
      this.highlightKeywords(["#pragma"], 'pragma');
  }


  set pre(string){
    if (typeof string !== 'string') return;
    this.highlights = [];
    this._pre = string;
    this.update();
  }

  update(){
    if (this.highlighter instanceof Function) this.highlighter();
    this.innerHTML = this.toString();
  }

  highlightRegex(regex, group_num, elClass){
    if (!(regex instanceof RegExp)) return;
    if (group_num < 0) return;

    const matches = this.pre.matchAll(regex);
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

  highlightKeywords(keyWords, elClass){
    if (!keyWords.length) return null;
    for (var i = 0; i < keyWords.length; i++){
      var keyword = keyWords[i];
      if (typeof keyword === 'string'){
        let regex = new RegExp(`\\W(${keyword})\\W`, 'g');
        this.highlightRegex(regex, 1, elClass);

        regex = new RegExp(`^(${keyword})\\W`, 'g');
        this.highlightRegex(regex, 1, elClass)
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

    if (startIndx < 0 || startIndx > endIndx || startIndx >= this.pre.length) throw '' + new PlusError('Highlight start index out of bounds');
    if (endIndx < 0 || endIndx == startIndx || endIndx >= this.pre.length) throw '' + new PlusError('Highlight end index out of bounds');

    var highlight = {start: startIndx, end: endIndx, elClass:elClass};
    if (!this._search(highlight)) throw '' + new PlusError(`text is already being highlight [${startIndx}, ${endIndx}]`)
    this.highlights.push(highlight);
    this.innerHTML = this.toString();
  }

  toString(){
    this._sort();
    let newString = this.pre;
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
