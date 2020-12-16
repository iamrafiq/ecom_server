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
  console.log("renaming....building url");

  let nameWithExt = nName.split(".");
  console.log("renaming....nameAndExt", nameWithExt);
  if (process.env.BUILD_TYPE === "dev") {
    return `https://${os.hostname()}:${process.env.PORT}/api/image/${
      nameWithExt[0]
    }?p=${queryFieldValue}${photoNumber}&ext=${nameWithExt[1]}`;
  } else {
    return `https://${os.hostname()}.com:${process.env.PORT}/api/image/${
      nameWithExt[0]
    }?p=${queryFieldValue}${photoNumber}&ext=${nameWithExt[1]}`;
  }
};
exports.checkSize = (file) => {
  if (file.size > 200000000) {
    return res.status(400).json({
      error: "Image should be less than 2kb in size",
    });
  }
};
exports.changeNameOnly = (
  newName,
  photoUrls,
  queryFieldValue,
  productPhotosFolder
) => {
  console.log("inside name change");
  let newUrls = [];
  let index = 0;
  photoUrls.forEach((photoUrl) => {
    console.log("photoUrl", photoUrl);

    var parts = url.parse(photoUrl, true);
    let ext = parts.query.ext;
    let pathModule = parts.pathname.split("/");
    let oldName = `${pathModule[pathModule.length - 1]}`;
    console.log("onldName", oldName);

    exports.productPhotoResolutionTypes.forEach((element) => {
      productPhotosFolder.forEach((ele) => {
        let oldPath = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${oldName}.${ext}`;
        let newPath = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${newName}.${ext}`;
        console.log("oldPath", oldPath);
        console.log("newPath", newPath);
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          console.log("renaming....");
        }
      });
    });
    index++;
    newUrls.push(
      exports.buildImageUrl(`${newName}.${ext}`, index, queryFieldValue)
    );
  });
  return newUrls;
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
  { width: 200, res: "low" },
  { width: 400, res: "medium" },
  { width: 800, res: "high" },
];
exports.productOfferPhotoResolutionTypes = [
  { width: 200, res: "low" },
  { width: 400, res: "medium" },
  { width: 800, res: "high" },
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

exports.unlinkStaticFile = (photoUrl, photo, offerPhoto) => {
  if (photoUrl && photoUrl.length > 0) {
    var parts = url.parse(photoUrl, true);
    let ext = parts.query.ext;
    let pathModule = parts.pathname.split("/");
    let fileName = `${pathModule[pathModule.length - 1]}.${ext}`;

    exports.productPhotoResolutionTypes.forEach((element) => {
      if (photo) {
        exports.productPhotosFolder.forEach((ele) => {
          let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;

          if (fs.existsSync(path)) {
            fs.unlinkSync(path, function (err) {
              console.log("error unlink", err);
            });
          }
        });
      }

      if (offerPhoto) {
        exports.productOfferPhotosFolder.forEach((ele) => {
          let path = `./${process.env.CLIENT_NAME}/images/${element.res}/${ele.folderName}/${fileName}`;

          if (fs.existsSync(path)) {
            fs.unlinkSync(path, function (err) {
              console.log("error unlink", err);
            });
          }
        });
      }
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
    .webp({ quality: 100 })
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
    .webp({ quality: 100 })
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
};
