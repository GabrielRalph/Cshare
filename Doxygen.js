class Doxygen extends SvgPlus{

  build(){
    this.props = {class: 'doxygen'}
    this._code = "";
    this.types = ["char", "const", "double", "enum", "float", "int", "long", "short", "signed", "static", "struct", "typedef", "union", "unsigned", "void", "volatile"];
    this.keyWords = ["auto", "break", "case", "continue", "default", "do", "else", "extern", "for", "goto", "if", "register", "return", "sizeof", "switch", "while"];
    this.doxydoc = new SvgPlus('div');
    this.clear();
  }

  clear(){
    this.icons = [];
    this.globals = {};
    this.unions = {};
    this.structs = {};
    this.typedefs = [];
    this.functions = {};
    this.defines = {};
    if (this.display) this.display = false;
    this._display = false;
    this.doxydoc.innerHTML = '';
  }

  set header(title){
    if (typeof title !== 'string') return;
    if (!this._header) {
      this._header = new SvgPlus('H1');
      this.prepend(this._header);
      this._header.onclick = () => {this.display = !this.display}
    }

    this._header.innerHTML = title;
  }

  get header(){
    if (!(this._header instanceof HTMLH1Element)) return null;
    return this._header.innerHTML;
  }


  set display(val){
    if (val){

      if (typeof this.code !== 'string') return;
      this.props = {style: {
        position: 'fixed',
        background: 'black',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      }}
      this.make();
      this.appendChild(this.doxydoc);
      this._display = true;
    }else{
      this.removeChild(this.doxydoc);
      this.props = {style: {
        position: 'initial',
      }}
      this._display = false;
    }
  }
  get display(){
    return this._display;
  }

  set code(val){
    if (typeof val !== 'string') return;
    this._code = val;
    this.clear();

  }

  get code(){
    return this._code;
  }

  make(){
    this.clear();

    try{
      this.find();
    }catch(e){
      console.log(e);
      return;
    }

    this.createDefines();
    this.createGlobals();
    this.createDoxyList('union');
    this.createDoxyList('struct');
    this.createDoxyList('function');
    this.createCode();
  }

  createCode(){
    let code_doxyList = new DoxyList('TABLE');
    this.doxydoc.appendChild(code_doxyList);

    code_doxyList.header = 'full code';
    code_doxyList.class = 'code-box';

    var doxyPre = new DoxyPre('PRE');
    doxyPre.doxygen = this;

    doxyPre.fhead = '';
    doxyPre.fbody = {body: this.code};

    code_doxyList.push(doxyPre);
  }

  createDefines(){
    if (Object.keys(this.defines).length == 0) return;

    let defines_doxyList = new DoxyList('TABLE');
    this.doxydoc.appendChild(defines_doxyList);
    defines_doxyList.header = 'defined macros';
    defines_doxyList.class = 'defines-box';


    let doxyPre = new DoxyPre('PRE');
    doxyPre.doxygen = this;

    let defines = '';
    for (var name in this.defines){
      defines += '#define ' + name + ' ' + this.defines[name] + '\n';
    }

    doxyPre.fhead = defines;
    defines_doxyList.appendChild(doxyPre);
  }

  createGlobals(){
    if (Object.keys(this.globals).length == 0) return;

    let globals_doxyList = new DoxyList('TABLE');
    this.doxydoc.appendChild(globals_doxyList);

    globals_doxyList.header = 'global variables';
    globals_doxyList.class = 'globals-box';

    var doxyPre = new DoxyPre('PRE');
    doxyPre.doxygen = this;

    let globals_string = "";
    for (var title in this.globals){
      globals_string += `${this.globals[title]}\n`;
    }

    doxyPre.fhead = globals_string;
    globals_doxyList.appendChild(doxyPre);
  }

  createDoxyList(name){
    title = name + 's';
    let functions = this[title];
    if (Object.keys(functions).length == 0) return;

    let doxyList = new DoxyList('TABLE');
    this.doxydoc.appendChild(doxyList);

    doxyList.header = name + 's';
    doxyList.class = name+'-box';

    for (var title in functions){
      var doxyPre = new DoxyPre('pre');
      doxyPre.doxygen = this;
      doxyPre.fbody = functions[title];
      doxyPre.fhead = title;
      doxyList.push(doxyPre);
    }
  }

  bracketSearch(string, i){
    if (typeof string !== 'string') return null;
    if (i >= string.length) return null;
    var inside = "";
    console.log(string[i]);
    var open = 1;
    while(open){
      if (string[i] === '{') open++;
      if (string[i] === '}') open--;
      inside += string[i];

      i++;
      if (i == string.length && open) throw '' + new PlusError('No closing bracket ' + inside);
    }
    return inside;
  }

  doxygenCommentParse(comments){
    //Remove * and ~
    comments = comments.replace(/[*][~]/g, '').replace(/^\s*[*]*/gm, '');
    if ((/^\s*$/g).test(comments)) return null;

    let params = {};

    let newComments = comments;

    let param_regex = /@param([^@]*)/g;
    const matches = comments.matchAll(param_regex);
    for (const match of matches){
      let param_desc = match[1];
      if (param_desc){
        newComments = newComments.replace(match[0], '');
        param_desc = param_desc.replace(/^(\n|\s)/gm, '').replace(/(\n|\s)$/gm, '');
        name = param_desc.split(/,* +/)[0];
        if (name){
          params[name] = param_desc;
        }
      }
    }
    let return_regex = /@return([^@]*)$/g;
    var return_match = comments.match(return_regex)[0];
    if (return_match){
      newComments = newComments.replace(return_match, '');
      return_match = return_match.replace('@', '').replace(/^(\n|\s)/gm, '').replace(/(\n|\s)$/gm, '');;
    }
    newComments = newComments.replace(/^(\n|\s)/gm, '').replace(/(\n|\s)$/gm, '');

    return {
      body: newComments,
      params: params,
      return: return_match,
    }
  }

  doxygenCommentSearch(string, i){
    i = i - 1;
    let close = false;
    let regex = /^\W+$/;

    //Find closing tag
    while (!close){
      let close_t = string[i - 1] + string[i];

      if (!regex.test(close_t)) return null;
      if (close_t === '*/') close = true;

      i --;
      if (i < 1) return null;
    }
    i--;

    let comments = "";
    let open = false;

    //Find open tag
    while (!open){
      let open_t = string[i - 2] + string[i - 1] + string[i];
      comments = string[i] + comments;
      if (open_t === '/**') open = true;
      i --;
      if (i < 2) return null;
    }

    return this.doxygenCommentParse(comments);
  }

  findFunctions(code){
    let newCode = code;
    if (typeof code !== 'string') return null;
    var functions = {}
    const matches = code.matchAll(/^\s*(\w+)\W+(\w+)[^(\w]*[(](.*?)[)](\s|\n)*?[{]/gm);
    for (const match of matches){
      let head = match[0];
      head = head.replace(/^\s*/g, '');

      let type = match[1];
      let name = match[2];

      if (!(this.keyWords.includes(name)||this.keyWords.includes(type))){
        let params = match[3].split(', ');

        var i = match.index + match[0].length;
        var body = this.bracketSearch(code, i);

        var comments = this.doxygenCommentSearch(code, match.index);
        newCode = newCode.replace(head + body, '')
        functions[head] = {
          body: head + body,
          type: type,
          name: name,
          params: params,
          comments: comments,
        }
      }
    }
    return {newCode: newCode, functions: functions};

  }

  findUnionOrStruct(code, utype){
    if (typeof code !== 'string') return null;

    let newCode = code;
    var vals = {}

    var regex = new RegExp(`(\\w*)\\s*${utype}\\s*(\\w*)\\s*[{]`, 'g');

    //Get all union heads
    const matches = code.matchAll(regex);
    for (const match of matches){

      //Remove white space from head
      let head = match[0];
      let typedef = match[1];
      let type = match[2];

      //Get union body
      let i = match.index + head.length;
      var body = this.bracketSearch(code, i);

      //If the union is a typedef add its type to types
      if (typedef === 'typedef'){
        if (type && type.length > 0){
          this.typedefs.push(type);
        }else{
          console.log('union declared as typedef without type name');
        }
      }

      //Check for global definition
      i += body.length;
      let global_def = "";
      while (code[i] != ';'){
        global_def += code[i];
        i++;
        if (i >= code.length || code[i] == '\n') throw '' + new PlusError('No ; after union definition');
      }

      body += global_def + ';';

      let newHead = `${typedef?'typedef ':''}${utype}${type?(' ' + type):''}{`

      //Add global definition
      global_def = global_def.replace(/^\s*/, '');
      if (global_def){
        this.globals[global_def] = (type ? type : utype) + ' ' + global_def +';';
      }

      //Add union
      vals[newHead] = {
        body: newHead + body,
        name: type,
      }

      newCode = newCode.replace(head + body, '');
    }
    let res = {newCode: newCode};
    res[utype] = vals;
    return res;
  }

  find(){
    let code = this.code;
    let res = this.findFunctions(code);
    this.functions = res.functions;
    res = this.findUnionOrStruct(res.newCode, 'union');
    this.unions = res.union;
    res = this.findUnionOrStruct(res.newCode, 'struct');
    this.structs = res.struct;
    this.findGlobals(res.newCode);
    this.findDefines(res.newCode);
  }

  findGlobals(code){
    const matches = code.matchAll(/(^\w\w*)\s*(\w*)[^;()]*;/gm);
    for (const match of matches){
      if (match[2]){
        this.globals[match[2]] = match[0];
      }
    }
  }

  findDefines(){
    var defines = {};

    const matches = this.code.matchAll(/#define\s*(\w*)\s*(\w*)/g);
    for (const match of matches){
      if (match[1] && match[2]){
        defines[match[1]] = match[2];
      }
    }

    this.defines = defines;
  }
}

// class DoxygenUnion extends Highlights{
//
// }
