const Advertisement = require("../models/advertisement");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image

exports.create = (req, res) => {
  console.log("Category Create", req.body);
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }

    let advertisement = new Advertisement(fields);

    if (fields.slugPages) {
      const slugPages = fields.slugPages.split(",");
      advertisement.slugPages = slugPages;
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
    .exec((err, advertisement) => {
      if (err || !advertisement) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.advertisement = advertisement;
      next();
    });
};
exports.readBySlug = (req, res) => {
  res.json(req.advertisement);
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
      req.advertisement = data;
      next();
    });
};

exports.remove = (req, res) => {
  console.log("remove called");
  let advertisement = req.advertisement;
  advertisement
    .remove()
    .then((result) => {
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
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }

    let advertisement = req.advertisement;
    advertisement = lodash.extend(advertisement, fields);

    if (fields.slugPages) {
      const slugPages = fields.slugPages.split(",");
      advertisement.slugPages = slugPages;
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
