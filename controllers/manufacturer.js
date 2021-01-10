const Manufacturer = require("../models/manufacturer");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image


exports.create = async (req, res) => {
  console.log("manuf Create", req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    }); // form.parse
  });
  let manuf = new Manufacturer(fields);
  console.log("fields..", fields);

  manuf
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

exports.manufacturerById = (req, res, next, id) => {
  console.log("manuf", id);

  Manufacturer.findById(id)
    .exec((err, data) => {
      if (err || !data) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.manufacturer = data;
      next();
    });
};
exports.read = (req, res) => {
  res.json(req.manufacturer);
};


exports.manufacturerBySlug = (req, res, next, slug) => {
  // console.log("categoryBySlug", slug);

  Manufacturer.find({ slug: slug })
    .select("-slugPages")
    .exec((err, data) => {
      if (err || !data) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.manufacturer = data;
      next();
    });
};

exports.remove = (req, res) => {
  console.log("manuf called");
  let manuf = req.manufacturer;
  manuf
    .remove()
    .then((result) => {
      console.log("deleted group", result);
      res.json({
        //result,
        message: "Group deleted successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: errorHandler(err),
      });
    });
};

exports.update = async (req, res) => {
  console.log("group update");
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    }); // form.parse
  });
 
  let manuf = req.manufacturer;
  manuf = lodash.extend(manuf, fields);

  manuf
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
  console.log("manuf list")
  Manufacturer.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

