const Group = require("../models/group");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image


exports.create = async (req, res) => {
  console.log("group Create", req.body);
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
  let group = new Group(fields);
  console.log("fields..", fields);

  group
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

exports.groupById = (req, res, next, id) => {
  console.log("group", id);

  Group.findById(id)
    .exec((err, group) => {
      if (err || !group) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.group = group;
      next();
    });
};
exports.read = (req, res) => {
  res.json(req.group);
};


exports.groupBySlug = (req, res, next, slug) => {
  // console.log("categoryBySlug", slug);

  Group.find({ slug: slug })
    .select("-slugPages")
    .exec((err, data) => {
      if (err || !data) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.group = data;
      next();
    });
};

exports.remove = (req, res) => {
  console.log("remove called");
  let group = req.group;
  group
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
 
  let group = req.group;
  group = lodash.extend(group, fields);

  group
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
  console.log("group list")
  Group.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json(data);
  });
};

