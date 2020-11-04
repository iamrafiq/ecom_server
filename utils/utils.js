const fs = require("fs");
var os = require("os");
var url = require("url");

exports.initClientDir = () => {
    let clientDir = `./${process.env.CLIENT_NAME}`;
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir);
    }
    clientDir = `./${process.env.CLIENT_NAME}/images`;
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir);
    }
    return clientDir;
  };
  
  exports.buildImageUrl = (obj, field) => {
    obj.url = `http://${os.hostname()}:${process.env.PORT}/api/image/?name=${
      field.path.split("/")[2]
    }`; // building image url to route
    obj.contentType = field.type;
  };
  exports.unlinkStaticFile = (photoUrl) => {
    if (photoUrl) {
      var parts = url.parse(photoUrl, true);
      const path = `./${process.env.CLIENT_NAME}/images/${parts.query.name}`;
        if (fs.existsSync(path)) {
          try {
            fs.unlinkSync(path, function (err) {
              console.log("error unlink", err);
            });
          } catch (err) {
            console.log(err);
          }
        }
    }
  };