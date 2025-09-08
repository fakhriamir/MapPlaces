const sharp = require('sharp');
//const uuidv4 = require('uuid/v4');
const path = require('path');

class Resize {
  constructor(folder) {
    this.folder = folder;
  }
  async save(buffer) {
    const filename = Resize.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(120, 120, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(filepath);
    
    return filename;
  }
  static filename() {
    return Tools.decryptText(req.session.uid)+".png";
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`)
  }
}
module.exports = Resize;