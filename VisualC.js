/*
CodeBlock is a div element that displays text in a pre element,
pre elements are used for code display.

CodeBlock can be extended to make other custom code blocks.
When building create a list of strings (i.e. this.modeNames)
that are keys to setters of itself. The setters must return
any thing that can be displayed as a string.

 @param doxygen, comments.
 @param body, contents of code.
 @param type, type of variable
*/
class CodeBlock extends SvgPlus{

  build(){
    this._header = new Highlights('h1');
    this.appendChild(this._header);
    this._pre = this.createChild('pre');
    this._expanded = true;
    this._mode_index = 0;
    this.props = {
      class: 'code-block'
    }
  }

  set expanded(value){
    if (value){
      if (this._expanded) return;
      this._expanded = true;
      if (this.contains(this._pre)) return;
      this.appendChild(this._pre);
    }else{
      if (!this._expanded) return;
      this._expanded = false;
      if (!this.contains(this._pre)) return;
      this.removeChild(this._pre);
    }
  }
  get expanded(){
    return this._expanded;
  }

  static isString(string){
    if (typeof string === 'string') return true;
    if (typeof string !== 'object') return false;
    if (!(string.toString instanceof Function)) return false;
    if (typeof string.toString() === 'string') return true;
    return false;
  }

  onclick(){
    this.expanded = !this.expanded;
  }

  set class(className){
    this.props = {
      class: 'code-block ' + className
    }
  }

  set doxygen(doxygen){
    this._doxygen = parseDoxygen(doxygen);
  }
  get doxygen(){
    return this._doxygen;
  }

  set body(body){
    this._body = body;
  }
  get body(){
    return this._body;
  }

  set type(type){
    this._type = type;
  }
  get type(){
    return this._type;
  }

  set name(name){
    this._name = name;

  }
  get name(){
    return this._name;
  }

  set params(params){
    this._params = params;
  }

  get params(){
    return this._params;
  }

  get value(){
    return this._value;
  }
  set value(value){
    this._value = value;
  }

  set mode(mode){
    this._mode = mode;
    this._header.pre = this.head;
    this._pre.innerHTML = this[mode];
  }

  get mode(){
    return this._mode;
  }
}


function parseDoxygen(doxygen){
  if (typeof doxygen != 'string') return '';
  let tags = ["@param", "@return", "@see"];
  tags.forEach((tag, i) => {
    let regexp = new RegExp(tag, 'g')
    doxygen = doxygen.replace(regexp, `<b class = "doxygen-tag">${tag}</b>`);
  });

  doxygen = doxygen.replace(/^[\t ]*/gm, '')

  return doxygen;
}


class Method extends CodeBlock{
  build(){
    this.modeNames = [
      "doxygenComments",
      "expanded",
    ];
    this.mode = 0;
  }
  get head(){
    return `<b class = "type">${this.type}</b> ${this.name}(${this.params});`
  }

  get expanded(){
    return `${this.type} ${this.name}(${this.params}){${this.body}}`
  }

  get doxygenComments(){
    return `${this.doxygen}`
  }
}

class Typedef extends CodeBlock{
  build(){
    this.modeNames = [
      "head",
      "expanded",
      "doxygenComments",
    ];
    this.mode = 0;
  }

  get head(){
    return `<b class = "key">typedef</b> ${this.type} ${this.name};`
  }

  get expanded(){
    return `<b class = "key">typedef</b> ${this.type}{${this.body}}${this.name};`
  }

  get doxygenComments(){
    return `${this.doxygen}`
  }
}


class CodeBlockList extends SvgPlus{
  build(){
    this.props = {class: "list"};
    this.heading_h2 = this.createChild('h2');
    this.contents = this.createChild('div');
    this._hidden = false;
    this._size = 0;
    this.heading_h2.onclick = () => {
      this._hidden = !this._hidden;
      if (this._hidden){
        this.removeChild(this.contents);
      }else{
        this.appendChild(this.contents)
      }
    }
  }

  get size(){
    return this._size;
  }

  set class(className){
    if (!CodeBlock.isString(className)) return;
    this.props = {class: "list " + className}
  }

  set heading(heading){
    if (!CodeBlock.isString(heading)) return;
    this.class = ('' + heading).toLowerCase().replace(".c", "");
    this.heading_h2.innerHTML = '' + heading;
  }
  get heading(){
    this.heading_h2.innerHTML
  }

  updateClipboard(newClip) {
    navigator.clipboard.writeText(newClip).then(function() {
      /* clipboard successfully set */
    }, function() {
      /* clipboard write failed */
    });
  }

  onclick(){
    this.updateClipboard(`${this}`)
  }

  appendItem(item){
    try{
      this.contents.appendChild(item);
      this._size ++;
    }catch(e){
      console.log(e);
    }
  }
  removeItem(item){
    try{
      this.contents.removeChild(item);
      this._size--;
    }catch(e){
      console.log(e);
    }
  }
  clearItems(){
    this.contents.innerHTML = '';
  }

  appendItems(items){
    if (!(items instanceof Array)) return;
    items.forEach((item) => {
      this.appendItem(item);
    });
  }

  toString(){
    let string = ''
    let children = this.contents.children;
    if (children.length == 0) return 'NONE';
    for (var i = 0; i < children.length; i++){
      string += `${children[i]}\n`
    }
    return string
  }
}

class Module extends CodeBlockList{

  /**
    codeToScopes breaks code up into bodys
    and global defs
  */
  static codeToScopes(code){
    if (typeof code !== 'string') return null;
    var bodys = [];
    var body = '';
    var open = 0;
    var inScope = false;
    for (var i = 0; i < code.length; i++){
      var char = code[i];
      open += char == '{' ? 1 : 0;
      open -= char == '}' ? 1 : 0;

      if (!inScope && open == 1){
        bodys.push({
          scope: 'global',
          code: body,
        });
        body = '';
        inScope = true;
      }

      body += char;

      if (inScope && open == 0){
        bodys.push({
          scope: 'local',
          code: body,
        })
        body = '';
        inScope = false;
      }
    }
    return bodys;
  }

  parser(code){
    let globals = new CodeBlockList('div');
    globals.heading = 'Globals';

    let typedefs = new CodeBlockList('div');
    typedefs.heading = 'Typedefs';

    let methods = new CodeBlockList('div');
    methods.heading = 'Functions';

    var scopes = Module.codeToScopes(code);
    scopes.forEach((scope, i) => {
      if (scope.scope == 'global'){
        let gcode = scope.code;

        //Check for function
        const m_matches = gcode.match(/(\/\*\*\s*([\W\w]*)\*\/)?\s*(\w+\s*[*]?\s*\w*)\s+(\w+)\s*[(]([^)]*)[)]\s*$/);
        if (m_matches != null && (i + 1 < scopes.length)) {

          scopes[i].code = scopes[i].code.replace(m_matches[0], '');
          scopes[i + 1].scope = 'used';

          let method = new Method('div');
          method.doxygen = m_matches[2];
          method.type = m_matches[3];
          method.name = m_matches[4];
          method.params = m_matches[5];
          method.body = scopes[i + 1].code;
          method.mode = 'doxygenComments';
          methods.appendItem(method);
          return;
        }

        const t_matches = gcode.match(/(\/\*\*\s*([\W\w]*)\*\/)?\s*typedef\s+(\w+)\s*(\w*)\s*$/);
        if (t_matches != null){
          var t_end = null;
          if (i + 2 < scopes.length) t_end = scopes[i + 2].code;
          if (t_end != null){
            const t_end_matches = t_end.match(/^\s*(\w+);/);
            if (t_end_matches != null){

              scopes[i].code = scopes[i].code.replace(t_matches[0], '');
              scopes[i + 2].code = scopes[i + 2].code.replace(t_end_matches[0], '');
              scopes[i + 1].scope = 'used';

              let typedef = new Typedef('div');
              typedef.doxygen = t_matches[2];
              typedef.type = t_matches[3];
              typedef.name = t_end_matches[1];
              HIGHLIGHTER.addCustomType(t_end_matches[1]);
              typedef.mode = "doxygenComments";
              typedefs.appendItem(typedef);
              return;
            }
          }
        }
      }
    });
    if (typedefs.size > 0) this.appendItem(typedefs);
    let global_defs = '';
    scopes.forEach((scope) => {
      if (scope.scope !== 'used') global_defs += scope.code;
    });
    if (global_defs.length > 0) {
      global_defs = global_defs.replace(/^\s*/gm, '');
      global_defs = global_defs.replace(/</g, '&#60;');
      global_defs = global_defs.replace(/>/g, '&#62;');
      let global_pre = new Highlights('pre');
      global_pre.pre = global_defs;
      globals.appendItem(global_pre);
      this.appendItem(globals);
    }
    if (methods.size > 0) this.appendItem(methods);

  }
}


class Project extends SvgPlus{
  set cFiles(object){
    this.innerHTML = '';
    if (typeof object !== 'object') return;
    for (var name in object){
        let module = new Module('div');
        module.heading = name;

        module.parser(object[name]);
        this.appendChild(module)
    }
  }

  static types = ["char", "const", "double", "enum", "float", "int", "long", "short", "signed", "static", "struct", "typedef", "union", "unsigned", "void", "volatile"];
  static keyWords = ["auto", "break", "case", "continue", "default", "do", "else", "extern", "for", "goto", "if", "register", "return", "sizeof", "switch", "while"];
}


/*
Notes

do bracket shearch, split into bodys, look behind bodys to get type and name,

*/
