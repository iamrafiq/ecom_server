const Advertisement = require("../models/advertisement");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const {initClientDir, unlinkStaticFile } =require("../utils/utils");
var os = require("os");

buildImageUrl= (field) => {
  return `http://${os.hostname()}:${process.env.PORT}/api/image/?name=${
   field.path.split("/")[2]
 }`; // building image url to route
};
exports.create = (req, res) => {
  console.log("Category Create", req.body);
  let form = new formidable.IncomingForm(); 
  form.keepExtensions = true; 
  form.uploadDir = initClientDir();
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }
    let advertisement = new Advertisement(fields);

    if (fields.slugPages) {
      console.log("slugssss...", fields.slugPages)
      let slugPages = fields.slugPages.split(",");
      advertisement.slugPages = slugPages;
    }
    if (files.photo) {
      //1kb = 1000
      //1mb = 1000000
      if (files.photo.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      advertisement.photo = buildImageUrl(files.photo);
    }

    advertisement
      .save()
      .then((result) => {
        //add  the sub cat id to its parent
        if (result.name === "root") {
          res.json(result);
        }
        res.json(result);
      })
      .catch((error) => {
        console.log(error);
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
    .select('-slugPages')
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
      unlinkStaticFile(result.photo)
      res.json({
        //result,
        message: "Advertisement deleted successfully",
      })
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.update = (req, res) => {
  console.log("advert update");
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClientDir();
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }

    let advertisement = req.advertisements;
    advertisement = lodash.extend(advertisement, fields);

    if (fields.slugPages) {
      const slugPages = fields.slugPages.split(",");
      advertisement.slugPages = slugPages;
    }

    if (files.photo) {
      //1kb = 1000
      //1mb = 1000000
      if (files.photo.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      unlinkStaticFile(advertisement.photo)
      advertisement.photo=buildImageUrl(files.photo);
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
