const Category = require("../models/category");
const lodash = require("lodash"); // for updating fields
const { errorHandler } = require("../helpers/dbErrorHandler");
const formidable = require("formidable"); // for uploading image
const fs = require("fs");
const { findById } = require("../models/category");
const { result } = require("lodash");

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

    if (files.icon) {
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
      //console.log('Files icon: ', files.icon);
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

    category
      .save()
      .then((result) => {
        //add  the sub cat id to its parent
        Category.findById(result.parent).exec((err, parent) => {
          if (err || !parent) {
            return res.status(400).json({
              error: errorHandler(err),
            });
          }

          parent.subcats.push(result._id);
          console.log("results", parent);

          parent
            .save()
            .then((result1) => {
              console.log(result1);
              res.json(result);
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
      .catch((error) => {
        console.log(error);
      });

    // category.save((err, result) => {
    //   if (err) {
    //     return res.status(400).json({
    //       error: JSON.stringify(err),
    //     });
    //   }

    //   //result.icon ='undefined'; // not sending the imge back
    //   res.json(result);
    // });
  });
};

exports.checkBySlug = (slug) => {
  Category.find({ slug: slug })
    .select("-icon -thumbnail")
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

exports.categoryBySlug = (req, res, next, slug) => {
  console.log("categoryBySlug", slug);
  Category.find({ slug: slug })
    .select("-icon -thumbnail")
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
    .select("-icon -thumbnail")
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
  console.log("remove called");
  let category = req.category; //add the the sub cat id to new parents
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
            res.json({
              //deletedCategory,
              message: "Category deleted successfully",
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

  // finally remove the category

  // category.remove((err, deletedCategory) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: errorHandler(err),
  //     });
  //   }

  //   res.json({
  //     //deletedCategory,
  //     message: "Category deleted successfully",
  //   });
  // });
};

exports.update = (req, res) => {
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

    console.log("fields", fields);

    let category = req.category;
    category = lodash.extend(category, fields);

    if (files.icon) {
      //console.log('Files icon: ', files.icon);
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
      //console.log('Files icon: ', files.icon);
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
                console.log("results", newParent);

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
    // category.save((err, result) => {
    //   if (err) {
    //     return res.status(400).json({
    //       error: JSON.stringify(err),
    //     });
    //   }
    //   Category.findById(result.parent).exec((err, category) => {
    //     if (err || !category) {
    //       return res.status(400).json({
    //         error: errorHandler(err),
    //       });
    //     }
    //     category.children.push(result._id);
    //     console.log("results", category);

    //     category.save((err, pResults) => {
    //       if (err) {
    //         return res.status(400).json({
    //           error: JSON.stringify(err),
    //         });
    //       }
    //     });
    //   });
    //   //result.icon ='undefined'; // not sending the imge back
    //   res.json(result);
    // });
  });
};

exports.items = (req, res) => {
  // res.json(req.category);
  Category.findAll({ parent: req.category._id })
    .select("-icon -thumbnail")
    // .populate('products')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.list = (req, res) => {
  Category.find({ trash: false })
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

exports.tree = (req, res) => {
  Category.find({ trash: false })
    .select("-icon -thumbnail")
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
        const parentEl = data[idMapping[el.parent]];
        // Add our current el to its parent's `children` array
        parentEl.children = [...(parentEl.children || []), el];
      });

      res.json(root.children);
    });
};

exports.icon = (req, res, next) => {
  if (req.category.icon.data) {
    res.set("Content-Type", req.category.icon.contentType);
    return res.send(req.category.icon.data);
  }
  next();
};
exports.thumbnail = (req, res, next) => {
  if (req.category.thumbnail.data) {
    res.set("Content-Type", req.category.thumbnail.contentType);
    return res.send(req.category.thumbnail.data);
  }
  next();
};

exports.getAllProducts = (req, res) => {
  //create query object to hold search value and category value
  console.log("....", req.params.categoryId);

  Category.find(req.category._id, (err, products) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(products);
  })
    .populate("products", "-photo")
    .select("-photo");
};
