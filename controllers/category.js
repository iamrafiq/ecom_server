const Category = require("../models/category");
const Product = require("../models/product");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const fs = require("fs");
const { findById } = require("../models/category");
const { result } = require("lodash");

const initClinentDir = () =>{
  let clientDir = `./${process.env.CLIENT_NAME}`;
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir);
  }
  clientDir = `./${process.env.CLIENT_NAME}/images`;
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir);
  }
  return clientDir;
}
exports.create = (req, res) => {
 
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClinentDir();
  // form.multiples = true;
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }

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

    let category = new Category(fields);

    if (fields.recursiveCats) {
      const recursiveCats = fields.recursiveCats.split(",");
      category.recursiveCategories = recursiveCats;
    }

    if (files.iconMenu) {
      //1kb = 1000
      //1mb = 1000000
      if (files.iconMenu.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      category.iconMenu.fileName = files.iconMenu.path.split("/")[2];
      category.iconMenu.contentType = files.iconMenu.type;
    }
    if (files.icon) {
      //1kb = 1000
      //1mb = 1000000
      if (files.icon.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      console.log("image path:", files.icon.path);
      category.icon.fileName = files.icon.path.split("/")[2];
      category.icon.contentType = files.icon.type;
      // category.icon.data = fs.readFileSync(files.icon.path);
      // category.icon.contentType = files.icon.type;
    }
    if (files.thumbnail) {
      //console.log('Files icon: ', files.icon);
      //1kb = 1000
      //1mb = 1000000
      if (files.thumbnail.size > 2500000000) {
        return res.status(400).json({
          error: "Image should be less than 250kb in size",
        });
      }
      category.thumbnail.fileName = files.thumbnail.path.split("/")[2];
      category.thumbnail.contentType = files.thumbnail.type;
      // category.thumbnail.data = fs.readFileSync(files.thumbnail.path);
      // category.thumbnail.contentType = files.thumbnail.type;
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
        console.log(error);
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
            unlinkStaticFile(result2.iconMenu.fileName);
            unlinkStaticFile(result2.icon.fileName);
            unlinkStaticFile(result2.thumbnail.fileName);

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

exports.update = (req, res) => {
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClinentDir();
  form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: JSON.stringify(err),
      });
    }

    let category = req.category;
    category = lodash.extend(category, fields);

    if (fields.recursiveCats) {
      const recursiveCats = fields.recursiveCats.split(",");
      category.recursiveCategories = recursiveCats;
    }

    if (files.iconMenu) {
      //1kb = 1000
      //1mb = 1000000
      console.log(
        "iconMenu",
        `./${process.env.CLIENT_NAME}/images/${req.category.iconMenu.fileName}`
      );
      if (files.iconMenu.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }
      // const path = `./${process.env.CLIENT_NAME}/images/${req.category.iconMenu.fileName}`;
      // if (fs.existsSync(path)) {
      //   try {
      //     fs.unlinkSync(path, function (err) {
      //       console.log("error unlink", err);
      //     });
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }

      unlinkStaticFile(req.category.iconMenu.fileName);

      category.iconMenu.fileName = files.iconMenu.path.split("/")[2];
      category.iconMenu.contentType = files.iconMenu.type;
    }
    if (files.icon) {
      //1kb = 1000
      //1mb = 1000000
      if (files.icon.size > 200000000) {
        return res.status(400).json({
          error: "Image should be less than 2kb in size",
        });
      }

      unlinkStaticFile(req.category.icon.fileName);

      category.icon.fileName = files.icon.path.split("/")[2];
      category.icon.contentType = files.icon.type;
    }
    if (files.thumbnail) {
      //console.log('Files icon: ', files.icon);
      //1kb = 1000
      //1mb = 1000000
      if (files.thumbnail.size > 2500000000) {
        return res.status(400).json({
          error: "Image should be less than 250kb in size",
        });
      }
      unlinkStaticFile(req.category.thumbnail.fileName);
      category.thumbnail.fileName = files.thumbnail.path.split("/")[2];
      category.thumbnail.contentType = files.thumbnail.type;
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
  });
};

const unlinkStaticFile=(fileName)=>{
  const path = `./${process.env.CLIENT_NAME}/images/${fileName}`;
  if (fs.existsSync(path)) {
    try {
      fs.unlinkSync(path, function (err) {
        console.log("error unlink", err);
      });
    } catch (err) {
      console.log(err);
    }
  }
}
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


exports.tree = (req, res) => {
  Category.find()
    .populate("parent")
    // .select("-icon -thumbnail")
    .sort("order")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      const idMapping = data.reduce((acc, el, i) => {
        acc[el._id] = i;
        return acc;
      }, {});

      let root = "";
      data.forEach((el) => {
        // Handle the root element
        if (!el.parent || el.parent === null) {
          root = el;
          return;
        }
        // Use our mapping to locate the parent element in our data array
        const parentEl = data[idMapping[el.parent._id]];
        // Add our current el to its parent's `children` array
        parentEl.children = [...(parentEl.children || []), el];
      });

      if (root.children) {
        res.json(root.children);
      } else {
        res.json(root);
      }
    });
};

exports.image = (req, res) => {
  let imageName = `${process.env.CLIENT_NAME}/images/${req.query.image_name}`;
  fs.readFile(imageName, (err, imageData) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.writeHead(200, {
      "Content-Type": "image/webp",
    });
    res.end(imageData);
  });
};

