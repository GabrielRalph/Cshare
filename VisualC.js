const firebaseConfig = {
  apiKey: "AIzaSyDniS0prRjEmOyKbMd4jequo9gkwe2otKI",
  authDomain: "fashion-galetora.firebaseapp.com",
  databaseURL: "https://fashion-galetora.firebaseio.com",
  projectId: "fashion-galetora",
  storageBucket: "fashion-galetora.appspot.com",
  messagingSenderId: "469438762797",
  appId: "1:469438762797:web:759f543ce82183b9f04da4",
  measurementId: "G-Q7DJ37H3D0"
};
firebase.initializeApp(firebaseConfig);
let syntax = new CSyntax();
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
    this._eye = new Eye('svg');
    this.appendChild(this._eye);
    this._eye.onEyeChange = () => {
        this.display = !this.display;
    }

    this._header = syntax.makeHighlighter('h1');
    this._header.addEventListener('click', () => {
      this.expanded = !this.expanded;
    })
    this._bodyPre = syntax.makeHighlighter('pre');
    this._doxyPre = this.createChild('pre');
    this.display = false;

    this.appendChild(this._header);
    this._expanded = true;
    this.props = {
      class: 'code-block'
    }
  }

  set header(val){
    this._header.html = val;
  }

  set bodyPre(val){
    this._bodyPre.html = val;
  }
  set doxyPre(val){
    this._doxyPre.innerHTML = val;
  }

  update(){
    this.header = this.head;
    this.bodyPre = this.codeBody;
    this.doxyPre = this.doxygenComments;
  }

  set display(val){
    if (val){
      if (this.contains(this._doxyPre)){
        this.removeChild(this._doxyPre);
      }
      if (!this.contains(this._bodyPre)){
        this.appendChild(this._bodyPre);
        this._display = true;
      }
    }else{
      if (this.contains(this._bodyPre)){
        this.removeChild(this._bodyPre);
      }
      if (!this.contains(this._doxyPre)){
        this.appendChild(this._doxyPre);
        this._display = false;
      }
    }
    this.update();
  }

  get display(){
    return this._display;
  }

  set expanded(value){
    if (value){
      if (this._expanded) return;
      this._expanded = true;
      if (this.display) this.appendChild(this._bodyPre);
      if (!this.display) this.appendChild(this._doxyPre);
    }else{
      if (!this._expanded) return;
      this._expanded = false;
      if (this.contains(this._doxyPre)) this.removeChild(this._doxyPre);
      if (this.contains(this._bodyPre)) this.removeChild(this._bodyPre);
    }
    this.update();

  }
  get expanded(){
    return this._expanded;
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
    this.update();
  }
  get body(){
    return this._body;

  }

  set type(type){
    this._type = type;
    this.update();

  }
  get type(){
    return this._type;
  }

  set name(name){
    this._name = name;
    this.update();


  }
  get name(){
    return this._name;
  }

  set pragmaStart(pragmaStart){
    this._pragmaStart = pragmaStart;
    this.update();


  }
  get pragmaStart(){
    return this._pragmaStart;
  }

  set pragmaEnd(pragmaEnd){
    this._pragmaEnd = pragmaEnd;
    this.update();


  }
  get pragmaEnd(){
    return this._pragmaEnd;
  }

  set params(params){
    this._params = params;
    this.update();

  }

  get params(){
    return this._params;
  }

  get value(){
    return this._value;
  }
  set value(value){
    this._value = value;
    this.update();

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
  get head(){
    return `${this.type} ${this.name}(${this.params});`
  }

  get codeBody(){
    return `${this.pragmaStart || ''}${this.type} ${this.name}(${this.params})${this.body}${this.pragmaEnd || ''}`
  }

  get doxygenComments(){
    return `${this.doxygen}`
  }
}

class Typedef extends CodeBlock{
  get head(){
    return `typedef ${this.type} ${this.name};`
  }

  get codeBody(){
    return `typedef ${this.type}${this.body}${this.name};`
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
    this.display = false;
    this._size = 0;
    this.heading_h2.onclick = () => {
      this.display = !this.display;

    }
  }

  set display(val){
    if (val){
      if ( !this.contains(this.contents) ) this.appendChild(this.contents);
      this._display = true;
    }else{
      if ( this.contains(this.contents) ) this.removeChild(this.contents);
      this._display = false;
    }
  }
  get display(){
    return this._display
  }

  get size(){
    return this._size;
  }

  set class(className){
    if (typeof className !== 'string') return;
    this.props = {class: "list " + className}
  }

  set heading(heading){
    if (typeof heading !== 'string') return;
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
        const m_matches = gcode.match(/(\/\*\*\s*([\W\w]*)\*\/)?\s*(#pragma[^\n]*\n)?\s*(\w+\s*[*]?\s*\w*)\s+(\w+)\s*[(]([^)]*)[)]\s*$/);
        if (m_matches != null && (i + 1 < scopes.length)) {
          scopes[i].code = scopes[i].code.replace(m_matches[0], '');
          scopes[i + 1].scope = 'used';

          let method = new Method('div');

          //If there are pragma's
          if (m_matches[3]){
            method.pragmaStart = m_matches[3];
            if (i + 2 < scopes.length){
              const pragma_match = scopes[i + 2].code.match(/(^\s*#pragma[^\n]*)\n/);
              if (pragma_match != null){
                method.pragmaEnd = pragma_match[1];
                scopes[i + 2].code = scopes[i + 2].code.replace(pragma_match[0], '');

              }
            }
          }

          method.doxygen = m_matches[2];
          method.type = m_matches[4];
          method.name = m_matches[5];
          method.params = m_matches[6];
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
              typedef.body = scopes[i + 1].code;
              typedef.doxygen = t_matches[2];
              typedef.type = t_matches[3];
              typedef.name = t_end_matches[1];
              syntax.add('custom-type',t_end_matches[1]);
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
      let global_pre = syntax.makeHighlighter('pre');
      global_pre.html = global_defs;
      globals.appendItem(global_pre);
      this.appendItem(globals);
    }
    if (methods.size > 0) this.appendItem(methods);

  }
}

class InputPlus extends SvgPlus{

  async oninput(e){
    let files = await this.readFiles(event.target.files);
    files.forEach((file) => {
      let fire_name = file.name.replace(/\./g, '_');
      firebase.database().ref('/tron/robot/' + fire_name).set({
        code: file.body,
        name: file.name
      })
    });

  }
  async readFile(file){
    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) return;
      var reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      }
      reader.readAsText(file);
      setTimeout(() => {reject(null)}, 10000);
    })
  }
  async readFiles(fileList){
    let files = [];
    if (!(fileList instanceof FileList)) return;
    for (var i = 0; i < fileList.length; i++){
      try{
        let res = await this.readFile(fileList[i]);
        files.push({
          body: res,
          name: fileList[i].name
        })
      }catch(e){
        alert(`Error loading files\n${e}`)
      }
    }
    return files;
  }
}
class Project extends SvgPlus{
  build(){
    this.props = {
      class: "project"
    }
    // this.input = new InputPlus('input');
    // this.input.props = {
    //   type: 'file'
    // }

  }
  set ref(val){
    if (typeof val !== 'string') return;
    this._refName = val;
    this._ref = firebase.database().ref('/tron/' + val);
    this._ref.on('value', (sc) => {
      this.cFiles = sc.val();
    })
  }

  get refName(){
    return this._refName;
  }

  set cFiles(object){
    this.innerHTML = '';
    this.createChild('h1').innerHTML = this.refName;
    if (typeof object !== 'object') return;
    for (var name in object){
        let mod = object[name];
        let module = new Module('div');
        module.heading = mod.name;
        module.parser(mod.code);
        this.appendChild(module)
    }
  }

  static types = ["char", "const", "double", "enum", "float", "int", "long", "short", "signed", "static", "struct", "typedef", "union", "unsigned", "void", "volatile"];
  static keyWords = ["auto", "break", "case", "continue", "default", "do", "else", "extern", "for", "goto", "if", "register", "return", "sizeof", "switch", "while"];
}


class Eye extends SvgPlus{
  build(){
    this.r = 10;
    this.pRatio = 0.4;
    this.phi = Math.PI/5;
    this.dt = 0;
    this.eye = new SvgPath('path');
    this.appendChild(this.eye);
    this.drawing = true;
    this.props = {
      viewBox: "-11 -11 22 22",
      transform: "rotate(90)"
    }


  }



  set r(val){
    if (typeof val != 'number'){
      val = parseFloat(val);
      if (Number.isNaN(val)) return;
    }
    this._r = val;
  }
  get r(){
    return this._r;
  }

  set pRatio(val){
    if (typeof val != 'number'){
      val = parseFloat(val);
      if (Number.isNaN(val)) return;
    }
    this._pRatio = val;
  }
  get pRatio(){
    return this._pRatio;
  }


  set phi(val){
    if (typeof val != 'number'){
      val = parseFloat(val);
      if (Number.isNaN(val)) return;
    }
    this._phi = val;
  }
  get phi(){
    return this._phi;
  }

  set drawing(val){
    //if drawing is toggled high.
    if ((!!val) && !this.drawing){
      if (!('_time' in this))this._time = 0;

      //Call starting occurence
      this._drawing = true;
      window.requestAnimationFrame((time) => { this.onAnimationFrame(time); })

    //if drawing is toggled low.
    }else if((!val) && this.drawing){
      this._lastTime = null;
      this._drawing = false;
    }
  }

  onAnimationFrame(time){
    if (this.drawing){
      this.draw(time);

      window.requestAnimationFrame((time2) => { this.onAnimationFrame(time2); })
    }
  }

  get drawing(){
    return this._drawing
  }

  onclick(e){
    if (!this.drawing){
      this.drawing = true;
      if (this.onEyeChange instanceof Function) this.onEyeChange();
    }
  }

  draw(dt){
    dt = this._time;
    this._time += 1;
    let theta = dt/17;
    let theta2 = this._time/17;

    let phi = this.phi * ( Math.cos(theta)*-1 + 1 ) / 2;
    if ( (Math.sin(theta) < 0 && Math.sin(theta2) > 0) || (Math.sin(theta) > 0 && Math.sin(theta2) < 0) ){
      this.drawing = false;
    }

    let pupilCenter = new Vector(0, this.r)
    let radius = new Vector(0, this.r);
    this.eye.clear();

    this.eye.
    M(radius.rotate(-phi)).
    A(new Vector(this.r), 0, 0, 1, radius.rotate(-this.pRatio*phi)).
    A(new Vector(this.pRatio*this.r, this.pRatio*this.r), 0, 0, 0, radius.rotate(this.pRatio*phi)).
    A(new Vector(this.r), 0, 0, 1, radius.rotate(phi)).
    L(new Vector(0)).Z();

  }
}
