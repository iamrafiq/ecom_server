const Category = require("../models/category");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const fs = require("fs");

exports.create = (req, res) => {
  console.log("Category Create", req.body);
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

    // check for all fields

    const { childs, name, order, trash } = fields;
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }
    if (!order) {
      return res.status(400).json({
        error: "Order is required",
      });
    }
    let category = new Category();
    category.name = name;
    category.order = order;
    category.trash = trash;
    if (childs) {
      category.childs = childs.split(",");
    }

    if (files.icon) {
      //console.log('Files photo: ', files.photo);
      //1kb = 1000
      //1mb = 1000000
      if (files.icon.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      category.icon.data = fs.readFileSync(files.icon.path);
      category.icon.contentType = files.icon.type;
    }
    if (files.thumbnail) {
      //console.log('Files photo: ', files.photo);
      //1kb = 1000
      //1mb = 1000000
      if (files.thumbnail.size > 2500000000) {
        return res.status(400).json({
          error: "Image should be less than 250kb in size",
        });
      }
      category.thumbnail.data = fs.readFileSync(files.thumbnail.path);
      category.thumbnail.contentType = files.thumbnail.type;
    }

    category.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: JSON.stringify(err),
        });
      }

      //result.photo ='undefined'; // not sending the imge back
      res.json(result);
    });
  });
};
// exports.create = (req, res) => {
//     console.log("Category Controller", req.body);
//     const category = new Category(req.body);
//     category.save((err, data)=>{
//         if (err){
//             return res.status(400).json({
//                 error: err
//             })
//         }

//         res.json({data});
//     })
// }

exports.categoryById = (req, res, next, id) => {
  console.log("categoryById", id)

  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    req.category = category;
    next();
  });
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.remove = (req, res) => {
  console.log("remove called")
  let category = req.category;
  category.remove((err, deletedCategory) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json({
      //deletedCategory,
      message: "Category deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  console.log("Category Update", req.body);
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

    // check for all fields

    const { childs, name, order, trash } = fields;
    // if (!name) {
    //   return res.status(400).json({
    //     error: "Name is required",
    //   });
    // }
    // if (!order) {
    //   return res.status(400).json({
    //     error: "Order is required",
    //   });
    // }
    // let cat = new Category();
    // cat.name = name;
    // cat.order = order;
    // cat.trash = trash;
    if (childs) {
      fields.childs = childs.split(",");
    }

    let category = req.category;
    category = lodash.extend(category, fields);

    if (files.icon) {
      //console.log('Files photo: ', files.photo);
      //1kb = 1000
      //1mb = 1000000
      if (files.icon.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      category.icon.data = fs.readFileSync(files.icon.path);
      category.icon.contentType = files.icon.type;
    }
    if (files.thumbnail) {
      //console.log('Files photo: ', files.photo);
      //1kb = 1000
      //1mb = 1000000
      if (files.thumbnail.size > 2500000000) {
        return res.status(400).json({
          error: "Image should be less than 250kb in size",
        });
      }
      category.thumbnail.data = fs.readFileSync(files.thumbnail.path);
      category.thumbnail.contentType = files.thumbnail.type;
    }


    category.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: JSON.stringify(err),
        });
      }

      //result.photo ='undefined'; // not sending the imge back
      res.json(result);
    });
  });
};
// exports.update = (req, res) => {
//   const category = req.category;
//   category.name = req.body.name;
//   category.save((err, data) => {
//     if (err) {
//       return res.status(400).json({
//         error: "Category dose not exist.",
//       });
//     }

//     res.json({ data });
//   });
// };

// exports.list = (req, res) => {
//   Category.find().exec((err, data) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler(err),
//       });
//     }

//     res.json(data);
//   });
// };

// exports.list = (req, res) => {
//   Category.find({trash:false})
//     .select("-icon -thumbnail")
//     .populate("childs", "-icon -thumbnail")
//     .exec((err, data) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }

//       res.json(data);
//     });
// };

exports.list = (req, res) => {
  Category.find({trash:false})
    .select("-icon -thumbnail")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
};

exports.icon = (req, res, next) => {
  console.log("icon middleware");
  if (req.category.icon.data) {
    res.set("Content-Type", req.category.icon.contentType);
    return res.send(req.category.icon.data);
  }
  next();
};
exports.thumbnail = (req, res, next) => {
  console.log("thumbnail middleware");
  if (req.category.thumbnail.data) {
    res.set("Content-Type", req.category.thumbnail.contentType);
    return res.send(req.category.thumbnail.data);
  }
  next();
};
