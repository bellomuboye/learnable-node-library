const fs = require('fs');
const path = require('path');
const helper = require('./helper')
var lib = {
    baseDir: path.join(__dirname, '/../.data/')
};

//creating
lib.create = (dir, filename, data, callback) => {
    //open file for writing
    const filePath = lib.baseDir + dir + "//" + filename + '.json';
    fs.open(filePath, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            //convert the data to string
            const stringData = JSON.stringify(data);
            //write th file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback("Error closing the new file");
                        }
                    });
                } else {
                    callback("Error writing to new file");
                }
            });

        } else {
            callback("could not create new file, it may already exists");
        }
    });
};

//reding
lib.read = (dir, filename, callback) => {
    const filePath = lib.baseDir + dir + "//" + filename + '.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (!err && data) {
            callback(false, JSON.parse(data));
        }
        else {
            callback(err, data);
        }
    });
};

//reading all files in a directory
lib.readAll = (dir, callback) => {
    const dirPath = lib.baseDir + dir;
    fs.readdir(dirPath, (err, files) => {
        if (!err && files) {
            let allFiles = []
            files.forEach((file) => {
                let fileName = file.split('.')[0]
                const filePath = dirPath + "//" + fileName + '.json';
                let fileData = JSON.parse(fs.readFileSync(filePath))
                let fileDetails = fileData
                fileDetails.id = fileName

                allFiles.push(fileDetails)
            })
            callback(false, JSON.parse(allFiles))
        } else {
            callback(err, data)
        }
    })
};

//updating
lib.update = (dir, filename, data, callback) => {
    const filePath = lib.baseDir + dir + "//" + filename + '.json';
    //open the file
    fs.open(filePath, 'r+', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        fs.readFile(fileDescriptor, 'utf-8', (err, bookToUpdate) => {
          if (!err && bookToUpdate) {
            let updatedBook = helper.formatObject(JSON.parse(bookToUpdate), data);
            var updatedData = JSON.stringify(updatedBook);
            //truncate the fule for update;
            fs.truncate(fileDescriptor, (err) => {
              if (!err) {
                fs.writeFile(filePath, updatedData, (err) => {
                  if (!err) {
                    fs.close(fileDescriptor, (err) => {
                      if (!err) {
                        callback(false);
                      } else {
                        callback("error closing the file");
                      }
                    });
                  } else {
                    callback('error writing to existing file');
                  }
                });
              }
            });
          } else {
            callback(err);
          }
        });
  
  
  
      } else {
        callback('could not open file for updating, maybe it does not exist');
      }
    });
  };

//Delete File
lib.delete = (dir, filename, callback) => {
    const filePath = lib.baseDir + dir + "//" + filename + '.json';
    fs.unlink(filePath, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};
//Check if file exists
lib.is_existing = (dir, filename, callback) => {
    const filePath = lib.baseDir + dir + "//" + filename + '.json';
    fs.access(filePath, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
    
};

lib.get_admin_token = () => {
  const filePath = lib.baseDir + "admin" + "//" + "index" + '.json';
  let fileData = JSON.parse(fs.readFileSync(filePath))
  return fileData.adminToken
}

module.exports = lib;