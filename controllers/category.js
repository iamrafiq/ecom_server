const Category = require("../models/category");
const Product = require("../models/product");
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
  photosFolder,
  processImage,
  changeNameOnly,
} = require("../utils/categoryFileRW");
const { runInNewContext } = require("vm");

// buildImageUrl = (field) => {
//   return `http://${os.hostname()}:${process.env.PORT}/api/image/?name=${
//     field.path.split("/")[2]
//   }`; // building image url to route
// };

exports.create = async (req, res) => {
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
  // check for all fields

  const { childs, name, order, slug, trash } = fields;
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

  if (!slug) {
    return res.status(400).json({
      error: "Slug is required",
    });
  }

  // if (this.checkBySlug(slug)){
  //   return res.status(400).json({
  //     error: "Slug should be unique",
  //   });
  // }
  // categorySchema;
  let category = new Category(fields);

  if (fields.recursiveCats) {
    const recursiveCats = fields.recursiveCats.split(",");
    category.recursiveCategories = recursiveCats;
  }

  if (files.icon) {
    category.icon = await processImage(
      files.icon,
      category.slug,
      photosFolder[0],
      photoResolutionTypes
    );
  }

  if (files.iconMenu) {
    category.iconMenu = await processImage(
      files.iconMenu,
      category.slug,
      photosFolder[1],
      photoResolutionTypes
    );
  }
  if (files.thumbnail) {
    category.thumbnail = await processImage(
      files.thumbnail,
      category.slug,
      photosFolder[2],
      photoResolutionTypes
    );
  }

  category
    .save()
    .then((result) => {
      //add  the sub cat id to its parent
      if (result.name === "root") {
        res.json(result);
      }
      Category.findById(result.parent).exec((err, parent) => {
        if (err || !parent) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }

        parent.subcats.push(result._id);
        // console.log("results", parent);

        parent
          .save()
          .then((result1) => {
            console.log(result1);
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error),
      });
    });
};

exports.checkBySlug = (slug) => {
  Category.find({ slug: slug })
    // .select("-icon -thumbnail")
    .exec((err, category) => {
      if (err) {
        return res.status(400).json({
          error: "check by slug error",
        });
      }

      return category ? false : true;
    });
};
exports.categoryById = (req, res, next, id) => {
  console.log("categoryById", id);
  Category.findById(id)
    .populate("parent")
    .exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.category = category;
      console.log("category", category);

      next();
    });
};

exports.categoryBySlug = (req, res, next, slug) => {
  console.log("categoryBySlug", slug);
  Category.findOne({ slug: slug })
    // .select("-icon -thumbnail")
    .populate("parent")
    .lean()
    .exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.category = category;
      next();
    });
};

exports.children = (req, res, next) => {
  Category.find({ parent: req.category._id })
    .populate("parent")
    // .select("-icon -thumbnail")
    .exec((err, categoris) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(categoris);
    });
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.remove = (req, res) => {
  // console.log("remove called");
  let category = req.category;
  // console.log("remove called", category.subcats);

  if (!category.subcats || category.subcats.length === 0) {
    removeFast(category, res, category.name);
  } else {
    return res.status(400).json({
      error: "Delete all subcategories at first",
    });
    // recursiveDeleter(category.subcats, res, category.name);
  }
};

const removeFast = (category, res, parentName) => {
  // console.log("remove fast cat", category);

  Category.findById(category.parent).exec((err, parent) => {
    if (err || !parent) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    const index = parent.subcats.indexOf(category._id);
    if (index > -1) {
      parent.subcats.splice(index, 1);
    }

    parent
      .save()
      .then((result1) => {
        console.log(result1);
        category
          .remove()
          .then((result2) => {
            if (result2.icon && result2.icon.length > 0) {
              unlinkStaticFile(result2.icon, photosFolder[0].folderName);
            }
            if (result2.iconMenu && result2.iconMenu.length > 0) {
              unlinkStaticFile(result2.iconMenu, photosFolder[1].folderName);
            }
            if (result2.thumbnail && result2.thumbnail.length > 0) {
              unlinkStaticFile(result2.thumbnail, photosFolder[2].folderName);
            }

            var bulk = Product.collection.initializeUnorderedBulkOp();
            bulk
              .find({
                categories: category._id,
              })
              .update({ $pull: { categories: category._id } }, { multi: true });

            bulk.execute(() => {
              res.json({
                //result,
                message: "Category deleted successfully",
              });
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
const recursiveDeleter = (catIds, res, parentName) => {
  return catIds.map((id) => {
    Category.findById(id).exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: errorHandl / category / er(err),
        });
      }
      // console.log("found catgegory", category.subcats);
      if (!category.subcats || category.subcats.length === 0) {
        removeFast(category, res, parentName);
        return;
      }
      return recursiveDeleter(category.subcats, res, parentName);
    });
  });
};

exports.update = async (req, res) => {
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
  if (files.icon) {
    if (req.category.icon && req.category.icon.length > 0) {
      unlinkStaticFile(req.category.icon, photosFolder[0].folderName);
    }
  }
  if (files.iconMenu) {
    if (req.category.iconMenu && req.category.iconMenu.length > 0) {
      unlinkStaticFile(req.category.iconMenu, photosFolder[1].folderName);
    }
  }
  if (files.thumbnail) {
    if (req.category.thumbnail && req.category.thumbnail.length > 0) {
      unlinkStaticFile(req.category.thumbnail, photosFolder[2].folderName);
    }
  }

  let category = req.category;
  category = lodash.extend(category, fields);

  if (fields.recursiveCats) {
    const recursiveCats = fields.recursiveCats.split(",");
    category.recursiveCategories = recursiveCats;
  }

  if (files.icon) {
    category.icon = await processImage(
      files.icon,
      category.slug,
      photosFolder[0],
      photoResolutionTypes
    );
  }

  if (!files.icon && category.icon && category.icon.length > 0 && fields.slug) {
    category.icon = changeNameOnly(fields.slug, category.icon, photosFolder[0]);
  }
  if (files.iconMenu) {
    category.iconMenu = await processImage(
      files.iconMenu,
      category.slug,
      photosFolder[1],
      photoResolutionTypes
    );
  }
  if (
    !files.iconMenu &&
    category.iconMenu &&
    category.iconMenu.length > 0 &&
    fields.slug
  ) {
    category.iconMenu = changeNameOnly(
      fields.slug,
      category.iconMenu,
      photosFolder[1]
    );
  }
  if (files.thumbnail) {
    category.thumbnail = await processImage(
      files.thumbnail,
      category.slug,
      photosFolder[2],
      photoResolutionTypes
    );
  }
  if (
    !files.thumbnail &&
    category.thumbnail &&
    category.thumbnail.length > 0 &&
    fields.slug
  ) {
    category.thumbnail = changeNameOnly(
      fields.slug,
      category.thumbnail,
      photosFolder[2]
    );
  }

  category
    .save()
    .then((result) => {
      // first remove the sub cat id from old parents
      Category.findById(category.old_parent).exec((err, oldParent) => {
        if (err || !oldParent) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }

        const index = oldParent.subcats.indexOf(result._id);
        if (index > -1) {
          oldParent.subcats.splice(index, 1);
        }

        oldParent
          .save()
          .then((result2) => {
            console.log(result2);
            // now find the new parent and push the result id
            Category.findById(result.parent).exec((err, newParent) => {
              if (err || !newParent) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }

              newParent.subcats.push(result._id);
              //  console.log("results", newParent);

              newParent
                .save()
                .then((result1) => {
                  console.log(result1);
                  res.json(result); // final result sending
                })
                .catch((err) => {
                  console.log(err);
                });
              // category.save((err, pResults) => {
              //   if (err) {
              //     return res.status(400).json({
              //       error: JSON.stringify(err),
              //     });
              //   }
              // });
            });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(result);
    });
};

exports.getAllProductsOfACategory = (req, res) => {
  //  res.json(req.category);
  // console.log("req.catid", req.category._id)
  Category.findById(req.category._id)
    // .select("-icon -thumbnail")
    .populate("parent")
    .populate("subcats")
     .populate("products")
    .populate({
      path: "recursiveCategories",
      select: { icon: 0, thumbnail: 0 },
      options: { sort: { order: 1 } },
    })
    //.populate({path: 'recursiveCategories', options: { sort: { 'order': -1 } }})
    //.populate("recursiveCategories", "-icon -thumbnail")

    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      data.products = req.products;
      data.advertisements = req.advertisements;
      res.json(data);
    });
};

exports.list = (req, res) => {
  Category.find()
    .populate("parent")
    // .select("-icon -thumbnail")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      res.json(data);
    });
};

// exports.tree = (req, res) => {
//   Category.find()
//     .populate("parent")
//     // .select("-icon -thumbnail")
//     .sort("order")
//     .exec((err, data) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }

//       const idMapping = data.reduce((acc, el, i) => {
//         acc[el._id] = i;
//         return acc;
//       }, {});

//       let root = "";
//       data.forEach((el) => {
//         // Handle the root element
//         if (!el.parent || el.parent === null) {
//           root = el;
//           return;
//         }
//         // Use our mapping to locate the parent element in our data array
//         const parentEl = data[idMapping[el.parent._id]];
//         // Add our current el to its parent's `children` array
//         parentEl.children = [...(parentEl.children || []), el];
//       });

//       if (root.children) {
//         res.json(root.children);
//       } else {
//         res.json(root);
//       }
//     });
// };

/**for rendering drawer items */
exports.tree = (req, res, next) => {
  console.log("home call tree")
  Category.find()
     .populate("parent")
     .select("-products")
    .sort("order")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      req.categories = data;
      next();
    });
};
