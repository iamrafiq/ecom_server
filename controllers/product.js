const formidable = require("formidable"); // for uploading image
const lodash = require("lodash"); // for updating fields
const fs = require("fs");
const Product = require("../models/product");
const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");
//const { CallTracker } = require("assert");
var mongoose = require("mongoose");
const {
  unlinkProductStaticFile,
  initClientDir,
  productResolutionTypes,
  createLowResProduct,
  renameFile,
  createMediumResProduct,
  createHighResProduct,
  unlinkTemporaryFile,
} = require("../utils/utils");
var os = require("os");
newNameOldPath = (photo, slug, subText, fileExtension) => {
  let frags = photo.path.split("/");
  if (subText && subText.length > 0) {
    return `${frags[0]}/${frags[1]}/${slug}-${subText
      .split(" ")
      .join("-")}.${fileExtension}`;
  } else {
    return `${frags[0]}/${frags[1]}/${slug}.${fileExtension}`;
  }
};
buildImageUrl = (path) => {
  return `http://${os.hostname()}:${process.env.PORT}/api/image/${
    path.split("/")[2]
  }?r=${productResolutionTypes.find((ele) => ele.res === "medium").res}`; // building image url to route
};
checkSize = (file) => {
  if (file.size > 200000000) {
    return res.status(400).json({
      error: "Image should be less than 2kb in size",
    });
  }
};

processImage = async (file, slug, subText) => {
  // checkSize(file);
  let nNPath = newNameOldPath(
    file,
    slug,
    subText,
    file.path.split("/")[2].split(".")[1]
  );
  renameFile(file, nNPath);
  await createLowResProduct(nNPath);
  await createMediumResProduct(nNPath);
  await createHighResProduct(nNPath);
  unlinkTemporaryFile(nNPath);
  return buildImageUrl(nNPath);
};
exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .populate("relatedProducts")
    .exec((err, product) => {
      if (err || !product || product.length <= 0) {
        return res.status(400).json({
          error: "Product not found",
        });
      }

      req.product = product;
      next();
    });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

async function startNewSession() {
  var conn = mongoose.connection;
  // clean models
  // await Promise.all(
  //   Object.entries(conn.models).map(([k, m]) => m.deleteMany())
  // );

  let session = await conn.startSession();
  session.startTransaction();

  // Collections must exist in transactions
  await Promise.all(
    Object.entries(conn.models).map(([k, m]) => m.createCollection())
  );

  return session;
}

exports.create = async (req, res) => {
  let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
  form.keepExtensions = true; // what ever image type is getting extentions will be there
  form.uploadDir = initClientDir();
  form.multiples = true;
  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      console.log(
        "within form.parse method, subject field of fields object is: " +
          fields.subjects
      );
      resolve({ fields, files });
    }); // form.parse
  });
  /*form.parse(req, (err, fields, files) => {
    // parsing the form for files and fields
    if (err) {
      return status(400).json({
        error: "form data parsing error",
      });
    }*/

  let product = new Product(fields);

  if (fields.cats) {
    const cats = fields.cats.split(",");
    product.categories = cats;
  } else {
    return res.status(400).json({
      error: "Please select categories of this product",
    });
  }
  if (fields.rc) {
    const recursiveCats = fields.rc.split(",");
    product.recursiveCategories = recursiveCats;
  }

  if (fields.relatedProducts) {
    const relatedProducts = fields.relatedProducts.split(",");
    product.relatedProducts = relatedProducts;
  }

  let photos = [];
  if (files.photo1Url) {
    photos.push(
      await processImage(files.photo1Url, fields.slug, fields.subText)
    );
  }
  if (files.photo2Url) {
    photos.push(
      await processImage(files.photo2Url, fields.slug, fields.subText)
    );
  }
  if (files.photo3Url) {
    photos.push(
      await processImage(files.photo3Url, fields.slug, fields.subText)
    );
  }
  if (files.photo4Url) {
    photos.push(
      await processImage(files.photo4Url, fields.slug, fields.subText)
    );
  }

  let offecrPhotos = [];
  if (files.offerPhoto1Url) {
    checkSize(files.offerPhoto1Url);
    offecrPhotos.push(buildImageUrl(files.offerPhoto1Url));
  }
  if (files.offerPhoto2Url) {
    checkSize(files.offerPhoto2Url);
    offecrPhotos.push(buildImageUrl(files.offerPhoto2Url));
  }
  if (files.offerPhoto3Url) {
    checkSize(files.offerPhoto3Url);
    offecrPhotos.push(buildImageUrl(files.offerPhoto3Url));
  }
  if (files.offerPhoto4Url) {
    checkSize(files.offerPhoto4Url);
    offecrPhotos.push(buildImageUrl(files.offerPhoto4Url));
  }
  product.photosUrl = photos;
  product.offerPhotosUrl = offecrPhotos;

  product
    .save()
    .then((result) => {
      Category.updateMany(
        { _id: { $in: product.categories } },
        { $push: { products: result._id } }
      )
        .then((results) => {
          res.json(result);
        })
        .catch((error) => {
          return res.status(400).json({
            error: errorHandler(error),
          });
        });
    })
    .catch((error) => {
      console.log(error);
    });
  // });
};
exports.remove = (req, res) => {
  let product = req.product;
  product
    .remove()
    .then((result) => {
      if (result.photosUrl && result.photosUrl.length > 0) {
        for (let i = 0; i < result.photosUrl.length; i++) {
          unlinkProductStaticFile(result.photosUrl[i]);
        }
      }
      if (result.offerPhotosUrl && result.offerPhotosUrl.length > 0) {
        for (let i = 0; i < result.offerPhotosUrl.length; i++) {
          unlinkProductStaticFile(result.offerPhotosUrl[i]);
        }
      }
      var bulk = Category.collection.initializeUnorderedBulkOp();
      bulk
        .find({
          products: result._id,
        })
        .update({ $pull: { products: result._id } }, { multi: true });

      bulk.execute(() => {
        res.json({
          //result,
          message: "Product deleted successfully",
        });
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(err),
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

exports.update = (req, res) => {
  console.log("update.....");
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = initClientDir();
  form.multiples = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "form data parsing error",
      });
    }

    let photos = [];
    if (files.photo1Url) {
      checkSize(files.photo1Url);
      photos.push(buildImageUrl(files.photo1Url));
      createLowRes(files.photo1Url);
    }
    if (files.photo2Url) {
      checkSize(files.photo2Url);
      photos.push(buildImageUrl(files.photo2Url));
      createLowRes(files.photo2Url);
    }
    if (files.photo3Url) {
      checkSize(files.photo3Url);
      photos.push(buildImageUrl(files.photo3Url));
      createLowRes(files.photo3Url);
    }
    if (files.photo4Url) {
      checkSize(files.photo4Url);
      photos.push(buildImageUrl(files.photo4Url));
      createLowRes(files.photo4Url);
    }

    let offecrPhotos = [];
    if (files.offerPhoto1Url) {
      checkSize(files.offerPhoto1Url);
      offecrPhotos.push(buildImageUrl(files.offerPhoto1Url));
    }
    if (files.offerPhoto2Url) {
      checkSize(files.offerPhoto2Url);
      offecrPhotos.push(buildImageUrl(files.offerPhoto2Url));
    }
    if (files.offerPhoto3Url) {
      checkSize(files.offerPhoto3Url);
      offecrPhotos.push(buildImageUrl(files.offerPhoto3Url));
    }
    if (files.offerPhoto4Url) {
      checkSize(files.offerPhoto4Url);
      offecrPhotos.push(buildImageUrl(files.offerPhoto4Url));
    }

    if (photos) {
      if (req.product.photosUrl && req.product.photosUrl.length > 0) {
        for (let i = 0; i < req.product.photosUrl.length; i++) {
          unlinkProductStaticFile(req.product.photosUrl[i]);
        }
      }
    }
    if (offecrPhotos) {
      if (req.product.offerPhotosUrl && req.product.offerPhotosUrl.length > 0) {
        for (let i = 0; i < req.product.offerPhotosUrl.length; i++) {
          unlinkProductStaticFile(req.product.offerPhotosUrl[i]);
        }
      }
    }
    /**fisrt unlinking photos if there then loadasing */
    let product = req.product;
    product = lodash.extend(product, fields);

    if (fields.cats) {
      const cats = fields.cats.split(",");
      product.categories = cats;
    }
    if (fields.rc) {
      const recursiveCats = fields.rc.split(",");
      product.recursiveCategories = recursiveCats;
    }

    if (fields.relatedProducts) {
      const relatedProducts = fields.relatedProducts.split(",");
      product.relatedProducts = relatedProducts;
    }

    product.photosUrl = photos;
    product.offerPhotosUrl = offecrPhotos;

    product
      .save()
      .then((result) => {
        var bulk = Category.collection.initializeUnorderedBulkOp();
        bulk
          .find({
            products: result._id,
          })
          .update({ $pull: { products: result._id } }, { multi: true });

        bulk.execute(() => {
          Category.updateMany(
            { _id: { $in: product.categories } },
            { $push: { products: result._id } }
          )
            .then((results) => {
              res.json(result);
            })
            .catch((error) => {
              return res.status(400).json({
                error: errorHandler(error),
              });
            });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

// exports.update = (req, res) => {
//   console.log("update.................");
//   let form = new formidable.IncomingForm();
//   form.keepExtensions = true;
//   form.parse(req, (err, fields, files) => {
//     if (err) {
//       return res.status(400).json({
//         error: "Image could not be uploaded",
//       });
//     }

//     let product = req.product;
//     product = lodash.extend(product, fields);
//     console.log("Product", product);
//     // 1kb = 1000
//     // 1mb = 1000000

//     if (files.photo) {
//       // console.log("FILES PHOTO: ", files.photo);
//       if (files.photo.size > 1000000) {
//         return res.status(400).json({
//           error: "Image should be less than 1mb in size",
//         });
//       }
//       product.photo.data = fs.readFileSync(files.photo.path);
//       product.photo.contentType = files.photo.type;
//     }

//     product.save((err, result) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       res.json(result);
//     });
//   });
// };

/**
 * sell / arrival
 * return product by sell route:
 * by sell = /products?sortyBy=sold&order=desc&limit=4
 * return product by arrival route:
 * by arrival = /products?sortyBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.soryBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .select("-photo") // deselecting photo, because photo is binary data size is huge
    .populate("category") // populate category means category information about this product will be available here automaticallly, because each product has a assined category
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

exports.getAllProducts = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  Product.find()
    .select("-photo -category")
    .sort([[order]])
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned,
 * product id which came through the parameter will discard
 * @param {*} req
 * @param {*} res
 */

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  Product.find({ _id: { $ne: req.product }, category: req.product.category }) // ne is a oparator this will discard the product related to the _id so this query will return all other products
    .limit(limit)
    .populate("category", "_id name") // populate only certien fileds of category
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

/**
 * returning all the categories related to all products,
 * there might be some categories in the category table not reletated to product
 * distinct: is funciton which will return all the category that has ref to product table
 * @param {*} req
 * @param {*} res
 */
exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};
/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and how the products to user based on what he wants
 * @param {*} req
 * @param {*} res
 */
exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key == "price") {
        //gte - grater than price [0-10]
        //lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  //create query object to hold search value and category value
  const query = {};
  //assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" }; // "i" for case sensitivity lower or uper both case
    // assigne category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product base on query object with 2 properties
    // search and category

    Product.find(query, (err, products) => {
      console.log(err);
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(products);
    }).select("-photo");
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};

exports.productsByCategory = (req, res) => {
  //create query object to hold search value and category value
  console.log("....", req.params.categoryId);
  const query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  // find the product base on query object with 2 properties
  // search and category

  Product.find(query, (err, products) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    res.json(products);
  }).select("-photo");
};
