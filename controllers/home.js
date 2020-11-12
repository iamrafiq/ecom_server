const Home = require("../models/home");

const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const fs = require("fs");
const { findById } = require("../models/category");
const { result } = require("lodash");

const {
  unlinkStaticFile,
  initClientDir,
  photoResolutionTypes,
  photoResolutionTypeslanding,
  photoResolutionGallery,
  photosFolder,
  processImage,
  changeNameOnly,
} = require("../utils/homeFileRW");

exports.create = async (req, res) => {
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClientDir();
  var { fields, allFiles } = await new Promise(async function (
    resolve,
    reject
  ) {
    let allFiles = [];
    form
      .on("file", function (field, file) {
        allFiles.push({ field: field, file: file });
      })
      .on("end", function () {});

    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, allFiles });
    }); //
  });

  let home = new Home(fields);
  let photoTutorial = [];
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      home.photoLanding = await processImage(
        i,
        allFiles[i].file,
        home.title,
        photosFolder[0],
        photoResolutionTypeslanding
      );
    } else if (allFiles[i].field === "photoTutorial") {
      photoTutorial.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title,
          photosFolder[1],
          photoResolutionTypes
        )
      );
    }
  }

  if (photoTutorial.length > 0) {
    home.photoTutorial = photoTutorial;
  }

  home
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Unable to create home",
      });
    });
};

exports.homeById = (req, res, next, id) => {
  console.log("categoryById", id);
  Home.findById(id).exec((err, home) => {
    if (err || !home) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    req.home = home;
    next();
  });
};

exports.read = (req, res) => {
  return res.json(req.home);
};

exports.getHome = (req, res) => {
  console.log("getHomeWithAll")
  Home.find().exec((err, data) => {
    if (err || data.length === 0) {
      return res.status(400).json({
        error: "Home not found",
      });
    }
    data[0].advertisements = req.advertisements;
    data[0].offerProducts = req.offerProducts;
    data[0].categories = req.categories;

    res.json(data[0]);
  });
};

exports.update = async (req, res) => {
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClientDir();
  var { fields, allFiles } = await new Promise(async function (
    resolve,
    reject
  ) {
    let allFiles = [];
    form
      .on("file", function (field, file) {
        allFiles.push({ field: field, file: file });
      })
      .on("end", function () {});

    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, allFiles });
    }); //
  });

  if (fields.actionG) {
    updateGallery(req, res, fields, allFiles);
  } else {
    updateMainForm(req, res, fields, allFiles);
  }
};
const updateGallery = async (req, res, fields, allFiles) => {
  let gallery = [];
  if (fields.actionG === "true") {
    console.log("deleting", fields.gId)
    let delObj = req.home.gallery.find((x) => x._id.toString() === fields.gId);
    unlinkStaticFile(delObj.photoG, photosFolder[2].folderName);
    gallery = req.home.gallery.filter((x) => x._id.toString() !== fields.gId);
    console.log("gallery", gallery)

  } else {
    let g = {};
    g.titleG = fields.titleG;
    g.shortDescriptionG = fields.shortDescriptionG;
    g.titleBanglaG = fields.titleBanglaG;
    g.shortDescriptionBanglaG = fields.shortDescriptionBanglaG;
    for (let i = 0; i < allFiles.length; i++) {
      if (allFiles[i].field === "photoG") {
        g.photoG = await processImage(
          -1,
          allFiles[i].file,
          fields.titleG,
          photosFolder[2],
          photoResolutionGallery
        );
      }
    }
    gallery.push(g);
    console.log("req.gallery", req.home.gallery)
    if (req.home.gallery) {
      for (let j = 0; j < req.home.gallery.length; j++){
        console.log("req.gallery pusing")

        gallery.push(req.home.gallery[j]);
      }
    }
  }

  let home = req.home;
  fields.gallery = gallery;
  home = lodash.extend(home, fields);

  home
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Unable to create home",
      });
    });
};
const updateMainForm = async (req, res, fields, allFiles) => {
  let unLinkPhotoLanding = false;
  let unlinkPhotoTutorial = false;
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      unLinkPhotoLanding = true;
    } else if (allFiles[i].field === "photoTutorial") {
      unlinkPhotoTutorial = true;
    }
  }
  if (unLinkPhotoLanding) {
    if (req.home.photoLanding && req.home.photoLanding.length > 0) {
      unlinkStaticFile(req.home.photoLanding, photosFolder[0].folderName);
    }
  }
  if (unlinkPhotoTutorial) {
    if (req.home.photoTutorial && req.home.photoTutorial.length > 0) {
      for (let j = 0; j < req.home.photoTutorial.length; j++) {
        unlinkStaticFile(req.home.photoTutorial[j], photosFolder[1].folderName);
      }
    }
  }
  let home = req.home;
  home = lodash.extend(home, fields);

  let photoTutorial = [];
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      home.photoLanding = await processImage(
        i,
        allFiles[i].file,
        home.title,
        photosFolder[0],
        photoResolutionTypeslanding
      );
    } else if (allFiles[i].field === "photoTutorial") {
      photoTutorial.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title,
          photosFolder[1],
          photoResolutionTypes
        )
      );
    }
  }

  if (photoTutorial.length > 0) {
    home.photoTutorial = photoTutorial;
  }

  home
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Unable to create home",
      });
    });
};
