const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const formidable = require("formidable"); // for uploading image
const lodash = require("lodash"); // for updating fields
const fs = require("fs");
const Product = require("../models/product");
const Category = require("../models/category");

const { errorHandler } = require("../helpers/dbErrorHandler");
const {
  unlinkStaticFile,
  initClientDir,
  processImage,
  productPhotosFolder,
  productOfferPhotosFolder,
  productPhotoResolutionTypes,
  productOfferPhotoResolutionTypes,
  changeNameOnly,
} = require("../utils/productFileRW");

exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .populate("relatedProducts")
    .exec((err, product) => {
      if (err || !product || product.length <= 0) {
        return res.status(400).json({
          error: errorHandler(err),
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
      await processImage(
        files.photo1Url,
        product.slug,
        product.subText,
        productPhotosFolder[0],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo2Url) {
    photos.push(
      await processImage(
        files.photo2Url,
        product.slug,
        product.subText,
        productPhotosFolder[1],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo3Url) {
    photos.push(
      await processImage(
        files.photo3Url,
        product.slug,
        product.subText,
        productPhotosFolder[2],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo4Url) {
    photos.push(
      await processImage(
        files.photo4Url,
        product.slug,
        product.subText,
        productPhotosFolder[3],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }

  let offerPhotos = [];

  if (files.offerPhoto1Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto1Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[0],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto2Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto2Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[1],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto3Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto3Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[2],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto4Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto4Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[3],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }

  product.photosUrl = photos;
  product.offerPhotosUrl = offerPhotos;

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
      return res.status(400).json({
        error: errorHandler(error),
      });
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
          unlinkStaticFile(result.photosUrl[i], true, false);
        }
      }
      if (result.offerPhotosUrl && result.offerPhotosUrl.length > 0) {
        for (let i = 0; i < result.offerPhotosUrl.length; i++) {
          unlinkStaticFile(result.offerPhotosUrl[i], false, true);
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
        error: errorHandler(error),
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

exports.update = async (req, res) => {
  console.log("update.....");
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.uploadDir = initClientDir();
  form.multiples = true;

  var { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    }); // form.parse
  });

  if (files.photo1Url !== undefined) {
    //  with out exsitance of  photo1Url there is no posibility of  photo2Url or 3 or 4
    if (req.product.photosUrl && req.product.photosUrl.length > 0) {
      for (let i = 0; i < req.product.photosUrl.length; i++) {
        unlinkStaticFile(req.product.photosUrl[i], true, false);
      }
    }
  }

  if (files.offerPhoto1Url !== undefined) {
    //  with out exsitance of  offerPhoto1Url there is no posibility of  offerPhoto2Url or 3 or 4
    if (req.product.offerPhotosUrl && req.product.offerPhotosUrl.length > 0) {
      for (let i = 0; i < req.product.offerPhotosUrl.length; i++) {
        unlinkStaticFile(req.product.offerPhotosUrl[i], false, true);
      }
    }
  }
  /**fisrt unlinking photos if there, then loadasing */
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

  let photos = [];

  if (files.photo1Url) {
    photos.push(
      await processImage(
        files.photo1Url,
        product.slug,
        product.subText,
        productPhotosFolder[0],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo2Url) {
    photos.push(
      await processImage(
        files.photo2Url,
        product.slug,
        product.subText,
        productPhotosFolder[1],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo3Url) {
    photos.push(
      await processImage(
        files.photo3Url,
        product.slug,
        product.subText,
        productPhotosFolder[2],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (files.photo4Url) {
    photos.push(
      await processImage(
        files.photo4Url,
        product.slug,
        product.subText,
        productPhotosFolder[3],
        productPhotoResolutionTypes,
        "p"
      )
    );
  }
  if (
    (!files.photo1Url &&
      !files.photo2Url &&
      !files.photo3Url &&
      !files.photo4Url &&
      product.photosUrl &&
      product.photosUrl.length > 0 &&
      fields.slug) ||
    (!files.photo1Url &&
      !files.photo2Url &&
      !files.photo3Url &&
      !files.photo4Url &&
      product.photosUrl &&
      product.photosUrl.length > 0 &&
      fields.subText)
  ) {
    // no photo came so phots are intac we need to change there name
    // new slug came, name change and slug change so change the names of photos in the file
    // and change the name in the url of the photos

    let newName = "";
    if (fields.slug && fields.subText) {
      newName = `${fields.slug}-${fields.subText.split(" ").join("-")}`;
    } else if (fields.slug) {
      newName = `${fields.slug}-${product.subText.split(" ").join("-")}`;
    } else if (fields.subText) {
      newName = `${product.slug}-${fields.subText.split(" ").join("-")}`;
    }
    photos = changeNameOnly(
      newName,
      product.photosUrl,
      "p",
      productPhotosFolder
    );
  }
  let offerPhotos = [];

  if (files.offerPhoto1Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto1Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[0],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto2Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto2Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[1],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto3Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto3Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[2],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }
  if (files.offerPhoto4Url) {
    offerPhotos.push(
      await processImage(
        files.offerPhoto4Url,
        product.slug,
        product.subText,
        productOfferPhotosFolder[3],
        productOfferPhotoResolutionTypes,
        "op"
      )
    );
  }

  if (
    (!files.offerPhoto1Url &&
      !files.offerPhoto2Url &&
      !files.offerPhoto3Url &&
      !files.offerPhoto4Url &&
      product.offerPhotosUrl &&
      product.offerPhotosUrl.length > 0 &&
      fields.slug) ||
    (!files.offerPhoto1Url &&
      !files.offerPhoto2Url &&
      !files.offerPhoto3Url &&
      !files.offerPhoto4Url &&
      product.offerPhotosUrl &&
      product.offerPhotosUrl.length > 0 &&
      fields.subText)
  ) {
    // no photo came so phots are intac we need to change there name
    // new slug came, name change and slug change so change the names of photos in the file
    // and change the name in the url of the photos

    console.log("insiiiiiiiid...");
    let newOfferName = "";
    if (fields.slug && fields.subText) {
      newOfferName = `${fields.slug}-${fields.subText.split(" ").join("-")}`;
    } else if (fields.slug) {
      newOfferName = `${fields.slug}-${product.subText.split(" ").join("-")}`;
    } else if (fields.subText) {
      newOfferName = `${product.slug}-${fields.subText.split(" ").join("-")}`;
    }
    offerPhotos = changeNameOnly(
      newOfferName,
      product.photosUrl,
      "op",
      productOfferPhotosFolder
    );
  }
  if (photos.length > 0) {
    product.photosUrl = photos;
  }
  if (offerPhotos.length > 0) {
    product.offerPhotosUrl = offerPhotos;
  }

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
  // });
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
          error: errorHandler(err),
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
          error: errorHandler(error),
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
  console.log("search.....");
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
    })
      .select("-photo")
      .limit(50);
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
  const query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  // find the product base on query object with 2 properties
  // search and category
  console.log("cat id", req.query.category);

  Product.find(
    {
      categories: req.params.categoryId,
    },
    (err, products) => {
      console.log(err);
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      console.log("..products..", products);
      res.json(products);
    }
  ).select("-photo");
};

exports.getOfferProducts = (req, res, next) => {
  const query = { applyOffer: 1 };
  Product.find(query, (err, products) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    req.offerProducts = products;
    next();
  }).select("-photo");
};
