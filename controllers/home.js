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
  photoResolutionTypesLogo,
  photoResolutionTypeslanding,
  photoResolutionGallery,
  photoResolutionTypesTutorial,
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
  let photoTutorialBengali = [];
  let photoLanding = [];
  let photoLandingBengali = [];

  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      photoLanding.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
          photosFolder[0],
          photoResolutionTypeslanding
        )
      );
      // home.photoLanding = await processImage(
      //   i,
      //   allFiles[i].file,
      //   home.title.replace(" ", "-"),
      //   photosFolder[0],
      //   photoResolutionTypeslanding
      // );
    } else if (allFiles[i].field === "photoLandingBengali") {
      photoLandingBengali.push(
        await processImage(
          i,
          allFiles[i].file,
          `${home.title
            .replace(" ", "-")
            .replace(/[^a-zA-Z0-9]/g, "-")}-bengali`,
          photosFolder[0],
          photoResolutionTypeslanding
        )
      );
    } else if (allFiles[i].field === "logo") {
      home.logo = await processImage(
        i,
        allFiles[i].file,
        "logo",
        photosFolder[3],
        photoResolutionTypesLogo
      );
    } else if (allFiles[i].field === "photoTutorial") {
      photoTutorial.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
          photosFolder[1],
          photoResolutionTypesTutorial
        )
      );
    } else if (allFiles[i].field === "photoTutorialBengali") {
      photoTutorialBengali.push(
        await processImage(
          i,
          allFiles[i].file,
          `${home.title
            .replace(" ", "-")
            .replace(/[^a-zA-Z0-9]/g, "-")}-bengali`,
          photosFolder[1],
          photoResolutionTypesTutorial
        )
      );
    }
  }

  if (photoLanding.length > 0) {
    home.photoLanding = photoLanding;
  }
  if (photoLandingBengali.length > 0) {
    home.photoLandingBengali = photoLandingBengali;
  }
  if (photoTutorial.length > 0) {
    home.photoTutorial = photoTutorial;
  }
  if (photoTutorialBengali.length > 0) {
    home.photoTutorialBengali = photoTutorialBengali;
  }
  home
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error),
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
  // console.log("getHomeWithAll");
  Home.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    if (data.length > 0) {
      
      data[0].advertisements = req.advertisements;
      data[0].offerProducts = req.offerProducts;
      data[0].offerProductsCount = req.offerProductsCount;
      data[0].categories = req.categories;
      res.json(data[0]);
    } else {
      res.json(null);
    }
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

  console.log("allFiles l", allFiles.length);
  if (fields.actionG) {
    updateGallery(req, res, fields, allFiles);
  } else {
    updateMainForm(req, res, fields, allFiles);
  }
};
const updateGallery = async (req, res, fields, allFiles) => {
  let gallery = [];
  if (fields.actionG === "true") {
    console.log("deleting", fields.gId);
    let delObj = req.home.gallery.find((x) => x._id.toString() === fields.gId);
    unlinkStaticFile(delObj.photoG, photosFolder[2].folderName);
    gallery = req.home.gallery.filter((x) => x._id.toString() !== fields.gId);
    console.log("gallery", gallery);
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
          fields.titleG.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
          photosFolder[2],
          photoResolutionGallery
        );
      }
    }
    gallery.push(g);
    console.log("req.gallery", req.home.gallery);
    if (req.home.gallery) {
      for (let j = 0; j < req.home.gallery.length; j++) {
        console.log("req.gallery pusing");

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
  let unLinkPhotoLandingBengali = false;
  let unLinkLogo = false;
  let unlinkPhotoTutorial = false;
  let unlinkPhotoTutorialBengali = false;

  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      unLinkPhotoLanding = true;
    } else if (allFiles[i].field === "photoLandingBengali") {
      unLinkPhotoLandingBengali = true;
    } else if (allFiles[i].field === "photoTutorial") {
      unlinkPhotoTutorial = true;
    } else if (allFiles[i].field === "photoTutorialBengali") {
      unlinkPhotoTutorialBengali = true;
    } else if (allFiles[i].field === "logo") {
      unLinkLogo = true;
    }
  }
  if (unLinkPhotoLanding) {
    if (req.home.photoLanding) {
      if (req.home.photoLanding.length > 0) {
        for (let j = 0; j < req.home.photoLanding.length; j++) {
          unlinkStaticFile(
            req.home.photoLanding[j],
            photosFolder[0].folderName
          );
        }
      } else {
        unlinkStaticFile(req.home.photoLanding, photosFolder[0].folderName);
      }

      //unlinkStaticFile(req.home.photoLanding, photosFolder[0].folderName);
    }
  }
  if (unLinkPhotoLandingBengali) {
    if (
      req.home.photoLandingBengali &&
      req.home.photoLandingBengali.length > 0
    ) {
      for (let j = 0; j < req.home.photoLandingBengali.length; j++) {
        unlinkStaticFile(
          req.home.photoLandingBengali[j],
          photosFolder[0].folderName
        );
      }
    }
  }
  if (unLinkLogo) {
    if (req.home.logo && req.home.logo.length > 0) {
      unlinkStaticFile(req.home.logo, photosFolder[3].folderName);
    }
  }
  if (unlinkPhotoTutorial) {
    if (req.home.photoTutorial && req.home.photoTutorial.length > 0) {
      for (let j = 0; j < req.home.photoTutorial.length; j++) {
        unlinkStaticFile(req.home.photoTutorial[j], photosFolder[1].folderName);
      }
    }
  }
  if (unlinkPhotoTutorialBengali) {
    if (
      req.home.photoTutorialBengali &&
      req.home.photoTutorialBengali.length > 0
    ) {
      for (let j = 0; j < req.home.photoTutorialBengali.length; j++) {
        unlinkStaticFile(
          req.home.photoTutorialBengali[j],
          photosFolder[1].folderName
        );
      }
    }
  }
  let home = req.home;
  home = lodash.extend(home, fields);

  let photoTutorial = [];
  let photoTutorialBengali = [];
  let photoLanding = [];
  let photoLandingBengali = [];

  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i].field === "photoLanding") {
      photoLanding.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
          photosFolder[0],
          photoResolutionTypeslanding
        )
      );
      // home.photoLanding = await processImage(
      //   i,
      //   allFiles[i].file,
      //   home.title.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
      //   photosFolder[0],
      //   photoResolutionTypeslanding
      // );
    } else if (allFiles[i].field === "photoLandingBengali") {
      photoLandingBengali.push(
        await processImage(
          i,
          allFiles[i].file,
          `${home.title
            .replace(" ", "-")
            .replace(/[^a-zA-Z0-9]/g, "-")}-bengali`,
          photosFolder[0],
          photoResolutionTypeslanding
        )
      );
    } else if (allFiles[i].field === "logo") {
      home.logo = await processImage(
        -1,
        allFiles[i].file,
        "logo",
        photosFolder[3],
        photoResolutionTypesLogo
      );
    } else if (allFiles[i].field === "photoTutorial") {
      photoTutorial.push(
        await processImage(
          i,
          allFiles[i].file,
          home.title.replace(" ", "-").replace(/[^a-zA-Z0-9]/g, "-"),
          photosFolder[1],
          photoResolutionTypesTutorial
        )
      );
    } else if (allFiles[i].field === "photoTutorialBengali") {
      photoTutorialBengali.push(
        await processImage(
          i,
          allFiles[i].file,
          `${home.title
            .replace(" ", "-")
            .replace(/[^a-zA-Z0-9]/g, "-")}-benglai`,
          photosFolder[1],
          photoResolutionTypesTutorial
        )
      );
    }
  }

  if (photoLanding.length > 0) {
    home.photoLanding = photoLanding;
  }
  if (photoLandingBengali.length > 0) {
    home.photoLandingBengali = photoLandingBengali;
  }
  if (photoTutorial.length > 0) {
    home.photoTutorial = photoTutorial;
  }
  if (photoTutorialBengali.length > 0) {
    home.photoTutorialBengali = photoTutorialBengali;
  }
  home
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error),
      });
    });
};

exports.remove = (req, res) => {
  let home = req.home;
  console.log("remove home")
  home
    .remove()
    .then((result) => {
      console.log("remove home inside")

      if (home.photoLanding) {
        if (home.photoLanding.length > 0) {
          for (let j = 0; j < home.photoLanding.length; j++) {
            unlinkStaticFile(home.photoLanding[j], photosFolder[0].folderName);
          }
        } else {
          unlinkStaticFile(home.photoLanding, photosFolder[0].folderName);
        }

        //unlinkStaticFile(req.home.photoLanding, photosFolder[0].folderName);
      }
      if (home.photoLandingBengali && home.photoLandingBengali.length > 0) {
        for (let j = 0; j < home.photoLandingBengali.length; j++) {
          unlinkStaticFile(
            home.photoLandingBengali[j],
            photosFolder[0].folderName
          );
        }
      }
      if (home.logo && home.logo.length > 0) {
        unlinkStaticFile(home.logo, photosFolder[3].folderName);
      }
      if (home.photoTutorial && home.photoTutorial.length > 0) {
        for (let j = 0; j < home.photoTutorial.length; j++) {
          unlinkStaticFile(home.photoTutorial[j], photosFolder[1].folderName);
        }
      }
      
      if (home.photoTutorialBengali && home.photoTutorialBengali.length > 0) {
        for (let j = 0; j < home.photoTutorialBengali.length; j++) {
          unlinkStaticFile(
            home.photoTutorialBengali[j],
            photosFolder[1].folderName
          );
        }
      }
      if (home.gallery && home.gallery.length > 0) {
        for (let j = 0; j < home.gallery.length; j++) {
          unlinkStaticFile(home.gallery[j], photosFolder[2].folderName);
        }
      }
    })
    .catch((error) => {
      console.log("remove home error", error);

      return res.status(400).json({
        error: errorHandler(error),
      });
    });
  // product.remove((err, deletedProduct) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: errorHandler(err),
  //     });
  //   }

  //   res.json({
  //     //deletedProduct,
  //     message: "Product deleted successfully",
  //   });
  // });
};
