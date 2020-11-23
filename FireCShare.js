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

class FireCShare{
  constructor(roomName){
    this.roomName = roomName;
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


  static async readFile(file){
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

  async watchCFiles(){
    let fileDocs;
    if (this.collection == null) return false;
    return new Promise((resolve, reject) => {
      setTimeout(() => { reject(false) }, 10000);

      try{
        this.collection.where('current', '==', true).onSnapshot((fileDocs) => {

          let cFiles = {};
          fileDocs.docChanges().forEach((change) => {
            let rev = change.doc.data();
            cFiles[rev.name] = rev.code;
          })
          this.fileUpdateHandler(cFiles);
          resolve(cFiles);
        }, () => {
          resolve(false);
        })
      }catch(e){
        resolve(false);
      }

    })
  }

  addUpdateListener(onUpdate){
    if (onUpdate instanceof Function) this._on_update.push(onUpdate);
  }

  set onUpdate(onUpdate){
    if (onUpdate instanceof Function) this._on_update = [onUpdate];
  }
  get onUpdate(){
    return this._on_update
  }

  fileUpdateHandler(cFiles){
    if (!(this.onUpdate instanceof Array)) return;
    this.onUpdate.forEach((func) => {
      if (func instanceof Function) func(cFiles);
    });
  }

  static async addCFiles(fileList){
    if (!(fileList instanceof FileList)) return;
    for (var i = 0; i < fileList.length; i++){
      try{
        let res = await this.addCFile(fileList[i]);
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

  async addCFile(file){
    if (!FireCShare.isValidCFile(file)) return false;

    let newFileCode = await FireCShare.readFile(file);

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
  static isValidCFile(file){
    if (!(file instanceof File)) return false;

    let fileName = file.name;
    return this.isValidCFileName(fileName)
  }

  static isValidCFileName(fileName){
    if (typeof fileName !== 'string') return false;
    if ((/\.c$/).test(fileName)){
      return true;
    }else{
      throw 'The file provided was not a c file'
    }
  }
}
