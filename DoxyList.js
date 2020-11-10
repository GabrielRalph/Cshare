class DoxyList extends SvgPlus{

  build(){
    if (!(this instanceof HTMLTableElement)) throw ''+ new PlusError("DoxyList must be a HTMLTableElement");
    this.body = this.createChild('TBODY');
  }

  set header(title){
    if ( typeof title !== 'string' ) return;

    if (!this._header){
      this._header = new SvgPlus('TR').createChild('TH');
      this.prepend(this._header);
    }

    this._header.innerHTML = title;
  }

  get header(){
    return this._header.innerHTML;
  }

  set class(class_name){
    if (typeof class_name !== 'string') return;
    this.props = {class: 'doxy-list ' + class_name}
  }
  get class(){
    return this.getAttribute('class');
  }

  push(doxyPre){
    if (!(doxyPre instanceof HTMLPreElement)) return false;

    //Make row
    let row = this.body.createChild('TR');

    //Make table cell with pre inside
    row.createChild('TD').appendChild(doxyPre);

    //Make arrow with a div inside
    let arrow = row.createChild('TD');
    arrow.createChild('DIV');
    doxyPre.arrow = arrow;
  }

  clear(){
    this.removeChild(this.body);
    this.body = this.createChild('TBODY');
  }
}
