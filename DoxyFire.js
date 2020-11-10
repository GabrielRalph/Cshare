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


class DoxyFire extends SvgPlus{
  build(){
    this.props = {class: 'doxy-fire'}
    this.doxygens = {}
    this.cshare = firebase.firestore().collection('cshare');
  }

  set roomName(val){
    if (typeof val !== 'string') return;
    this._roomName = val;
  }
  get roomName(){
    return this._roomName;
  }


  get collection(){
    if (typeof this.roomName !== 'string') return null;
    return this.cshare.doc(this.roomName).collection(this.roomName);
  }

  isValidFile(file){
    if (!(file instanceof File)) return false;

    let fileName = file.name;
    return this.isValidFileName(fileName)
  }

  isValidFileName(fileName){
    if (typeof fileName !== 'string') return false;
    if ((/\.c$/).test(fileName)){
      return true;
    }else{
      throw 'The file provided was not a c file'
    }
  }

  makeDoxygen(code, name){
    if (!this.doxygens[name]){
      this.doxygens[name] = new Doxygen('div');
      this.appendChild(this.doxygens[name]);
    }

    let doxygen = this.doxygens[name];

    doxygen.code = code;
    doxygen.header = name;
  }

  async watchFiles(){
    let fileDocs;
    if (this.collection == null) return false;
    return new Promise((resolve, reject) => {
      setTimeout(() => { reject(false) }, 10000);

      try{

        this.collection.where('current', '==', true).onSnapshot((fileDocs) => {
          console.log('snapshot');

          fileDocs.docChanges().forEach((change) => {
            let rev = change.doc.data();
            this.makeDoxygen(rev.code, rev.name);
          })

          resolve(true);
        }, () => {
          resolve(false);
        })

      }catch(e){
        console.log(e);
        resolve(false);
      }
    })
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


  async addFiles(fileList){
    if (!(fileList instanceof FileList)) return;
    for (var i = 0; i < fileList.length; i++){
      try{
        let res = await this.addFile(fileList[i]);
      }catch(e){
        alert(`Error loading files\n${e}`)
      }
    }
    return true;
  }


  async addRevision(newFile){

    //Try and get the last revision of the file
    var oldFile;
    try{
      let oldFileDocs = await this.collection.where('name', '==', newFile.name).orderBy('rev', 'desc').limit(1).get();
      oldFile = oldFileDocs.docs[0].data();

    //If no revision could be found
    }catch(e){
      console.log('newest revision not found');
      return false;
    }

    //This shouldn't happen unless db has been tampered with
    if (!oldFile.current) console.log('Newest revision is not set as current');
    console.log(oldFile);

    //Try and set the oldFile to not current
    try{
      await this.collection.doc(oldFile.name + oldFile.rev).update({
        current: false
      })

    //Fails to set current of the oldFile false
    }catch(e){
      console.log('failed to change the old revision from current to not current');
      console.log(e);
      return false;
    }

    //Try and set the new file doc
    newFile.rev = oldFile.rev + 1;
    try{
      let res = await this.collection.doc(newFile.name + newFile.rev).set(newFile);

    //File was not set
    }catch(e){
      console.log('Failed to add new revision');

      //Reset old revision to new current
      try{
        await this.collection.doc(oldFile.name + oldFile.rev).update({
          current: true
        })

      //Reset did not occurr
      }catch(e2){
        console.log('Failed to set the old revision back to current');
        return false;
      }
    }

    console.log('Success!');
    return true;
  }

  async addFile(file){
    if (!this.isValidFile(file)) return false;

    let newFileCode = await this.readFile(file);

    let newFile = {
      rev: 0,
      name: file.name,
      code: newFileCode,
      current: true,
    }

    try{
      console.log('adding file ' + newFile.name);
      await this.collection.doc(newFile.name + newFile.rev).set(newFile);

    }catch(e){
      console.log('createing new revision');
      return await this.addRevision(newFile);
    }

    console.log('Succussfully added new file');
    return true;
  }
}
