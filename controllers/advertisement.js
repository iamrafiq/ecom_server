const Advertisement = require("../models/advertisement");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const {
  unlinkStaticFile,
  initClientDir,
  photoResolutionTypes,
  photosFolder,
  processImage,
  changeNameOnly,
} = require("../utils/banerAdHorizontalFileRW");

exports.create = async (req, res) => {
  console.log("add Create", req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = initClientDir();
  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    }); // form.parse
  });
  let advertisement = new Advertisement(fields);
  console.log("fields..", fields);
  if (fields.slugPages) {
    let slugPages = fields.slugPages.split(",");
    advertisement.slugPages = slugPages;
  }
  if (files.photo) {
    advertisement.photo = await processImage(
      files.photo,
      advertisement.slug,
      photosFolder[0],
      photoResolutionTypes
    );
  }
  if (files.photoBangla) {
    advertisement.photoBangla = await processImage(
      files.photoBangla,
      advertisement.slug,
      photosFolder[1],
      photoResolutionTypes
    );
  }
  advertisement
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      return res.status(400).json({
        error: "Unable to create advertisiment",
      });
    });
};

exports.advertisementById = (req, res, next, id) => {
  console.log("advertisementById", id);

  Advertisement.findById(id)
    .populate("parent", "-icon -thumbnail")
    .exec((err, advertisements) => {
      if (err || !advertisements) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.advertisements = advertisements;
      next();
    });
};
exports.read = (req, res) => {
  res.json(req.advertisements);
};
exports.advertisementsBySlug = (req, res, next, slug) => {
  console.log("categoryBySlug", slug);

  Advertisement.find({ slugPages: slug })
    .select("-slugPages")
    .exec((err, data) => {
      if (err || !data) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.advertisements = data;
      next();
    });
};

exports.remove = (req, res) => {
  console.log("remove called");
  let advertisement = req.advertisements;
  advertisement
    .remove()
    .then((result) => {
      console.log("adr", result);
      if (result.photo && result.photo.length > 0) {
        unlinkStaticFile(result.photo, photosFolder[0].folderName);
      }
      if (result.photoBangla && result.photoBangla.length > 0) {
        unlinkStaticFile(result.photoBangla, photosFolder[1].folderName);
      }
      res.json({
        //result,
        message: "Advertisement deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.update = async (req, res) => {
  console.log("advert update");
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClientDir();
  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    }); // form.parse
  });
  if (files.photo) {
    if (req.advertisements.photo && req.advertisements.photo.length > 0) {
      unlinkStaticFile(req.advertisements.photo, photosFolder[0].folderName);
    }
  }
  if (files.photoBangla) {
    if (req.advertisements.photoBangla && req.advertisements.photoBangla.length > 0) {
      unlinkStaticFile(req.advertisements.photoBangla, photosFolder[1].folderName);
    }
  }
  let advertisement = req.advertisements;
  advertisement = lodash.extend(advertisement, fields);

  if (fields.slugPages) {
    const slugPages = fields.slugPages.split(",");
    advertisement.slugPages = slugPages;
  }

  if (files.photo) {
    advertisement.photo = await processImage(
      files.photo,
      advertisement.slug,
      photosFolder[0],
      photoResolutionTypes
    );
  }
  if (files.photoBangla) {
    advertisement.photoBangla = await processImage(
      files.photoBangla,
      advertisement.slug,
      photosFolder[1],
      photoResolutionTypes
    );
  }
  if (
    !files.photo &&
    advertisement.photo &&
    advertisement.photo.length > 0 &&
    fields.slug
  ) {
    advertisement.photo = changeNameOnly(
      fields.slug,
      advertisement.photo,
      photosFolder[0]
    );
  }
  if (
    !files.photoBangla &&
    advertisement.photoBangla &&
    advertisement.photoBangla.length > 0 &&
    fields.slug
  ) {
    advertisement.photoBangla = changeNameOnly(
      fields.slug,
      advertisement.photoBangla,
      photosFolder[1]
    );
  }
  advertisement
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    });
};

exports.list = (req, res) => {
  Advertisement.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json(data);
  });
};
