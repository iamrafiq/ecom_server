const fs = require("fs");
var url = require("url");

exports.resolutionTypes = [
  { width: 80, res: "low" },
  { width: 200, res: "midum" },
  { width: 400, res: "high" },
];

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

exports.unlinkStaticFile = (photoUrl) => {

  if (photoUrl && photoUrl.length > 0) {
    var parts = url.parse(photoUrl, true);
    let paths = [];
    paths.push(`./${process.env.CLIENT_NAME}/images/${parts.query.name}`);
    exports.resolutionTypes.forEach((element) => {
      paths.push(
        `./${process.env.CLIENT_NAME}/images/${element.width}_${parts.query.name}`
      );
    });
    paths.forEach((element) => {
      if (fs.existsSync(element)) {
        try {
          fs.unlinkSync(element, function (err) {
            console.log("error unlink", err);
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  }
};
