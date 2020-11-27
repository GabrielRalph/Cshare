class RunningChannel{
  constructor(box, svg){
    this.stitchLength = 20;
    this.channels = 6;
    this.box = box;
    this.svg = svg;
    this.size = 300;

  }

  set size(val){
    this._size = val;
    console.log(`${this._size}vw`);
    this.svg.props = {
      width:`${this._size}vw`
    }
  }
  get size(){
    return this._size;
  }

  begin(group){
    if (!(group instanceof SVGGElement)) return;
    let paths = group.getElementsByTagName('path');
    console.log(paths);
    if (paths.length < 2) return;
    this.group = group;
    this.pathA = paths[0];
    this.pathB = paths[1];

    this.lengthA = this.pathA.getTotalLength();
    this.lengthB = this.pathB.getTotalLength();

    let avgLength = (this.lengthA + this.lengthB)/2;
    this.stitchCount = avgLength/this.stitchLength;

    this.incA = this.stitchLength;
    this.incB = this.stitchLength;

    this.pointPath = new SvgPath('path');
    this.pointPath.props = {
      'stroke-linecap': 'round',
      'stroke-width': '4',
      'stroke': '#55555540'
    }
    this.pointPath.addPoint = function (v1){
      this.M(v1).L(v1);
    };
    this.pointPath.M(new Vector(0));


    this.a = 0;
    this.b = this.lengthB;

    this.i = 0;

    this.channelPaths = [];
    for (var i = 0; i < this.channels; i++){
      let path = new SvgPath('path');
      this.channelPaths.push(path);
      this.group.appendChild(path);
      path.props = {
        stroke: 'tomato'
      }
    }
    this.group.appendChild(this.pointPath);

  }

  findNextSegment(lA, lB, oldDif = Infinity){
    lA = lA < 0 ? 0 : lA;
    lB = lB < 0 ? 0 : lB;

    let tA = this.getTangentAtLength(this.pathA, lA, 0.01);
    let tB = this.getTangentAtLength(this.pathB, lB, -0.01);
    let pA = this.getPointAtLength(this.pathA, lA);
    let pB = this.getPointAtLength(this.pathB, lB);

    let tdA = tA.dot(pB.sub(pA));
    let tdB = tB.dot(pA.sub(pB));

    let dif = Math.abs(tdA - tdB);
    if (dif < oldDif){
      if (tdA > tdB){
        return this.findNextSegment(lA - 0.3, lB - 0.3, dif);
      }else if(tdB > tdA){
        return this.findNextSegment(lA + 0.3, lB + 0.3, dif);
      }
    }
    return {pA: pA, pB: pB, lA: lA, lB: lB, tA: tA, tB: tB}
  }

  getPointAtLength(path, l){
    return new Vector(path.getPointAtLength(l));
  }
  getTangentAtLength(path, l, dir = -0.01){
    let v1 = this.getPointAtLength(path, l);
    let v2 = this.getPointAtLength(path, l + dir);
    let t = v1.sub(v2);
    return t.dir();
  }

  addChannelPoint(v1, v2){
    let div = 0;

    // this.pointPath.addPoint(v1);
    // this.pointPath.addPoint(v2);
    this.channelPaths.forEach((path) => {
      let divPoint = v1.getPointAtDiv(v2, div)
      div += 1 / (this.channels);
      // this.pointPath.addPoint(divPoint);
      this.box.focusOn(v1.add(v2).div(2));
      if (path.d.length == 0) {
        path.M(divPoint.round(0));
      }else{
        path.L(divPoint.round(0));
      }
    });
  }

  next(){
    if (this.b > 0){
      let res = this.findNextSegment(this.a, this.b);
      this.a = res.lA;
      this.b = res.lB;
      // console.log(res);
      this.addChannelPoint(res.pB, res.pA);
      this.a += 10;
      this.b -= 10;
      return true;
    }
    if (this.size > 100){
      this.size--;
      this.svg.props = {
        width: `${this.size}vw`
      }
      return true;
    }
    return false;

    // let v1 = new Vector(this.pathA.getPointAtLength(this.a));
    // let v2 = new Vector(this.pathB.getPointAtLength(this.b));
    // this.addChannelPoint(v1, v2);
    // this.a += this.incA;
    // this.b -= this.incB;
    // return !(this.a > this.lengthA || this.b < 0)
  }

  end(){

  }
}
