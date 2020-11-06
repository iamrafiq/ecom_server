const fs = require("fs");
var url = require("url");
var sharp = require("sharp");
var os = require("os");

exports.newName = (slug, subText, fileExtension) => {
  if (subText && subText.length > 0) {
    return `${slug}-${subText.split(" ").join("-")}.${fileExtension}`;
  } else {
    return `${slug}.${fileExtension}`;
  }
};
exports.buildImageUrl = (nName, photoNumber, queryFieldValue) => {
  let nameAndExt = nName.split(".");
  return `http://${os.hostname()}:${process.env.PORT}/api/image/${
    nameAndExt[0]
  }?p=${queryFieldValue}${photoNumber}&ext=${nameAndExt[1]}`;
};
exports.checkSize = (file) => {
  if (file.size > 200000000) {
    return res.status(400).json({
      error: "Image should be less than 2kb in size",
    });
  }
};

exports.processImage = async (
  file,
  slug,
  subText,
  photoFolder,
  resObjs,
  queryFieldName
) => {
  let nName = exports.newName(
    slug,
    subText,
    file.path.split("/")[2].split(".")[1]
  );
  await exports.createLowResProduct(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[0]
  );
  await exports.createMediumResProduct(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[1]
  );
  await exports.createHighResProduct(
    file.path,
    photoFolder.folderName,
    nName,
    resObjs[2]
  );
  await exports.unlinkTemporaryFile(file.path);
  return exports.buildImageUrl(nName, photoFolder.photoNumber, queryFieldName);
};
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
    let ext = parts.query.ext;
    let pathModule = parts.pathname.split("/");
    let fileName = `${pathModule[pathModule.length - 1]}.${ext}`;

    exports.productPhotoResolutionTypes.forEach((element) => {
      exports.productPhotosFolder.forEach((ele) => {
        let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;

        if (fs.existsSync(path)) {
          fs.unlinkSync(path, function (err) {
            console.log("error unlink", err);
          });
        }
      });
      exports.productOfferPhotosFolder.forEach((ele) => {
        let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;

        if (fs.existsSync(path)) {
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
