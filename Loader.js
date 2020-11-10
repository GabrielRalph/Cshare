class Loader extends SvgPlus{
  build(){
    this.background = 'black';
    this.loaderIcon = new WaveyHeart('svg');
    this.appendChild(this.loaderIcon);
  }

  set background(val){
    if (typeof val !== 'string') return;
    this._background = val;
    this.styles = {background: val}
  }
  get background(){
    return this._background;
  }

  set color(val){
    if (typeof val !== 'string') return;
    this.loaderIcon.props = {stroke: val};
    this._color = val;
  }

  get color(){
    return this._color;
  }

  set show(val){
    if (val){
      this.styles = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        'z-index': '100',
        background: this.background,
        display: 'flex'
      }
      this.loaderIcon.move = true;
    }else{
      this.loaderIcon.move = false;
      this.styles = {
        display: 'none',
      }
    }
  }
  get show(){
    return this.loaderIcon.move;
  }

  async delay(ms){
    if (typeof ms !== 'number') return;
    if (Number.isNaN(ms)) return;
    if (ms < 0) return;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), ms);
    })
  }

  async loadAsyncFunction(func, time = 2000){
    if (!(func instanceof Function)) return;

    let rn = Date.now();

    this.show = true;
    let res;

    res = await func();

    await this.delay(time + rn - Date.now());
    this.show = false;
    return res;
  }
}

class WaveyHeart extends SvgPlus{
  build(){
    if (!(this instanceof SVGSVGElement)) throw '' + new PlusError('Wavey must be an SVG SVG Element');
    this.props = {
      viewBox: '-17 -19 34 32',
      stroke: 'white',
      width: '50vw',
      styles: {
        margin: 'auto',
        transform: 'scale(1, -1)',
      }
    }
    this.path = new SvgPath('path');
    this.path.props = {'stroke-linejoin': 'round', 'stroke-linecap': 'round'}
    this.appendChild(this.path);

    this.resolution = 0.1;
    this.tail_length = Math.PI/2;
    this.color_degree = true;
  }

  set move(val){
    if (val){
      this._move = true;
      this.start();
    }else{
      this._move = false;
    }
  }
  get move(){
    if (!this._move) return false;
    return true;
  }
  start(){
    let next = (t) => {
      this.draw(t);
      if (this.move){
        window.requestAnimationFrame(next);
      }
    }
    window.requestAnimationFrame(next);
  }

  h_x(t){
    return 16 * Math.pow(Math.sin(t), 3);
  }
  h_y(t){
    return 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  }
  h(t){
    return new Vector(this.h_x(t), this.h_y(t));
  }

  draw(time){
    time /= 250;

    if (this.color_degree){
      let deg = Math.round(180 * time / Math.PI) % 360;
      let color = `hsl(${deg}deg, 100%, 50%)`;
      this.path.props = {stroke: color}
    }else{
      this.path.props = {stroke: 'inherit'}
    }

    this.path.clear();
    this.path.M(this.h(time))
    for (var t = 0; t < this.tail_length; t += this.resolution){
      this.path.L(this.h(time + t))
    }
  }
}
