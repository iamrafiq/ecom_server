const fs = require("fs");
var url = require("url");
var sharp = require("sharp");

exports.productResolutionTypes = [
  { width: 80, res: "low" },
  { width: 200, res: "medium" },
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
  exports.productResolutionTypes.forEach((element) => {
     let dir = `${clientDir}/${element.res}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
  return clientDir;
};

exports.unlinkStaticFile =  (photoUrl) => {

  if (photoUrl && photoUrl.length > 0) {
    var parts = url.parse(photoUrl, true);
    console.log("parts....", parts)
    let pathModule = parts.path.split("/");
    let paths = [];
    //paths.push(`./${process.env.CLIENT_NAME}/images/${parts.query.r}/${pathModule[pathModule.lenght - 1]}`);
    exports.productResolutionTypes.forEach((element) => {
      paths.push(`./${process.env.CLIENT_NAME}/images/${element.res}/${pathModule[pathModule.lenght - 1]}`);

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

exports.unlinkTemporaryFile =  (photoUrl) => {

  if (photoUrl && photoUrl.length > 0) {
    if (fs.existsSync(photoUrl)) {
      try {
        fs.unlinkSync(photoUrl, function (err) {
          console.log("error unlink", err);
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};
// exports.unlinkStaticFile = (photoUrl) => {

//   if (photoUrl && photoUrl.length > 0) {
//     var parts = url.parse(photoUrl, true);
//     let paths = [];
//     paths.push(`./${process.env.CLIENT_NAME}/images/${parts.query.name}`);
//     exports.productResolutionTypes.forEach((element) => {
//       paths.push(
//         `./${process.env.CLIENT_NAME}/images/${element.width}/${parts.query.name}`
//       );
//     });
//     paths.forEach((element) => {
//       if (fs.existsSync(element)) {
//         try {
//           fs.unlinkSync(element, function (err) {
//             console.log("error unlink", err);
//           });
//         } catch (err) {
//           console.log(err);
//         }
//       }
//     });
//   }
// };

exports.createLowResProduct = async (path) => {
  let resObj = exports.productResolutionTypes.find((ele) => ele.res === "low");
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 50 })
    .toFile(`./${frags[0]}/${frags[1]}/${resObj.res}/${frags[2]}`);
};
exports.createMediumResProduct = async (path) => {
  let resObj = exports.productResolutionTypes.find((ele) => ele.res === "medium");
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 50 })
    .toFile(`./${frags[0]}/${frags[1]}/${resObj.res}/${frags[2]}`);
};
exports.createHighResProduct = async (path) => {
  let resObj = exports.productResolutionTypes.find((ele) => ele.res === "high");

  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 100 })
    .toFile(`./${frags[0]}/${frags[1]}/${resObj.res}/${frags[2]}`);
};
exports.renameFile = (file, newPath) =>{
  fs.renameSync(file.path, newPath);
}
