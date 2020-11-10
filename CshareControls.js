class Controls extends SvgPlus{
  build(){

    this.loader = new Loader('div');
    document.body.appendChild(this.loader);

    this.loader.loadAsyncFunction(async () => {return true}) //For fun

    if (!(this instanceof HTMLDivElement)) throw '' + new PlusError('Controls must be a DIV element');

    this.doxyFire = new DoxyFire('div');

    this.room = new Inpt('INPUT');
    this.connect = new Btn('svg');
    this.add = new Btn('svg');
    this.header = new SvgPlus('H1');

    this.connect.onclick = () => {this.connectToRoom()}
    this.add.onclick = () => {this.addFile()}

    this.connected = false;

    this.props = {
      id: 'cc-controls'
    }
  }

  set connected(val){
    if (val){
      this.innerHTML = '';
      this.appendChild(this.header);
      this.appendChild(this.add);
      document.body.appendChild(this.doxyFire);
    }else{
      this.appendChild(this.room);
      this.appendChild(this.connect);
    }
  }

  async connectToRoom(){
    this.doxyFire.roomName = this.room.value;

    this.header.innerHTML = this.room.value;
    this.loader.loadAsyncFunction(async () => {
      this.connected = await this.doxyFire.watchFiles();
      return true;
    }, 1000)
    if (!this.connected){
      this.room.value = '';
      this.room.props = {placeholder: 'Invalid room :('}
    }
  }

  addFile(){
    let input = new SvgPlus('INPUT');
    document.body.appendChild(input)
    input.props = {type: 'file', class: 'hidden'};

    input.oninput = (e) => {
      handle(e)
    }

    let handle = (e) => {
      let file = event.target.files[0];
      this.loader.loadAsyncFunction(async () => {
        return await this.doxyFire.addFiles(event.target.files);
      });
    }
    input.click();
  }
}

class Btn extends SvgPlus{
  build(){
    if (!(this instanceof SVGSVGElement)) throw '' + new PlusError('Controls must be an SVG element');
    this.props = {
      style: {background: 'white'},
      viewBox: '0 0 100 100',
      class: 'btn'
    }
  }

  set class(val){
    if (typeof val !== 'string') return;
    this._class = val;
    this.props = {class: 'btn ' + val}
  }
  get class(){
    return this._class;
  }
}

class Inpt extends SvgPlus{
  build(){
    if (!(this instanceof HTMLInputElement)) throw '' + new PlusError('Controls must be an Input element');
    this.props = {class: 'inpt'}
  }

  set class(val){
    if (typeof val !== 'string') return;
    this._class = val;
    this.props = {class: 'inpt ' + val}
  }
  get class(){
    return this._class;
  }
}
