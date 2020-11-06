const fs = require("fs");
var url = require("url");
var sharp = require("sharp");
const { result } = require("lodash");

exports.productPhotoResolutionTypes = [
  // low medium high order is importent
  { width: 80, res: "low" },
  { width: 200, res: "medium" },
  { width: 400, res: "high" },
];
exports.productOfferPhotoResolutionTypes = [
  { width: 120, res: "low" },
  { width: 250, res: "medium" },
  { width: 500, res: "high" },
];
exports.productPhotosFolder = [
  { photoNumber: 1, folderName: "p1" },
  { photoNumber: 2, folderName: "p2" },
  { photoNumber: 3, folderName: "p3" },
  { photoNumber: 4, folderName: "p4" },
];
exports.productOfferPhotosFolder = [
  { photoNumber: 1, folderName: "op1" },
  { photoNumber: 2, folderName: "op2" },
  { photoNumber: 3, folderName: "op3" },
  { photoNumber: 4, folderName: "op4" },
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
  exports.productPhotoResolutionTypes.forEach((element) => {
    let dir = `${clientDir}/${element.res}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    exports.productPhotosFolder.forEach((ele) => {
      let dir = `${clientDir}/${element.res}/${ele.folderName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });
    exports.productOfferPhotosFolder.forEach((ele) => {
      let dir = `${clientDir}/${element.res}/${ele.folderName}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });
  });
  return clientDir;
};

exports.unlinkStaticFile = (photoUrl) => {
  if (photoUrl && photoUrl.length > 0) {
    var parts = url.parse(photoUrl, true);
    let pathModule = parts.pathname.split("/");
    let fileName = pathModule[pathModule.length - 1];
    console.log("filename..", fileName)
    let paths = [];
    //paths.push(`./${process.env.CLIENT_NAME}/images/${parts.query.r}/${pathModule[pathModule.lenght - 1]}`);
    exports.productPhotoResolutionTypes.forEach((element) => {
      exports.productPhotosFolder.forEach((ele) => {
        let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;
        console.log("path..", path)

        if (fs.existsSync(path)) {
          console.log("exist..", path)

          fs.unlinkSync(path, function (err) {
            console.log("error unlink", err);
          });
        }
      });
      exports.productOfferPhotosFolder.forEach((ele) => {
        let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;
        console.log("offer path..", path)


        if (fs.existsSync(path)) {
          console.log("offer exist..", path)

          fs.unlinkSync(path, function (err) {
            console.log("error unlink", err);
          });
        }
      });
    });
  }
};

exports.unlinkTemporaryFile = (photoUrl) => {
  if (photoUrl && photoUrl.length > 0) {
    if (fs.existsSync(photoUrl)) {
      fs.unlinkSync(photoUrl, function (err) {
        if (err) console.log("error unlink", err);
      });
    } else {
    }
  } else {
  }
};
// exports.unlinkProductStaticFile = (photoUrl) => {

//   if (photoUrl && photoUrl.length > 0) {
//     var parts = url.parse(photoUrl, true);
//     let paths = [];
//     paths.push(`./${process.env.CLIENT_NAME}/images/${parts.query.name}`);
//     exports.productPhotoResolutionTypes.forEach((element) => {
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

exports.createLowResProduct = async (
  path,
  photoFileNumber,
  newName,
  resObj
) => {
  //let resObj = exports.productPhotoResolutionTypes.find((ele) => ele.res === "low");
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 50 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFileNumber}/${newName}`
    );
};
exports.createMediumResProduct = async (
  path,
  photoFileNumber,
  newName,
  resObj
) => {
  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 50 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFileNumber}/${newName}`
    );
};
exports.createHighResProduct = async (
  path,
  photoFileNumber,
  newName,
  resObj
) => {
  // let resObj = exports.productPhotoResolutionTypes.find((ele) => ele.res === "high");

  let frags = path.split("/");
  await sharp(path)
    .resize({
      fit: sharp.fit.contain,
      width: resObj.width,
    })
    .webp({ quality: 100 })
    .toFile(
      `./${frags[0]}/${frags[1]}/${resObj.res}/${photoFileNumber}/${newName}`
    );
};
exports.renameFile = async (file, newPath) => {
  fs.renameSync(file.path, newPath);
  console.log("renaming file");
  // new Promise((resolve, reject) => {
  //   fs.rename(file.path, newPath, (err)=>{
  //     if (err){
  //       console.log(err)
  //     }
  //     resolve("file name changed")
  //   });
  // })
  //   .then((result) => {})
  //   .catch((error) => console.log(error));
};
