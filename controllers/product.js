const formidable = require('formidable'); // for uploading image
const lodash=require('lodash'); // for updating fields
const fs = require('fs');
const Product = require('../models/product');
const {errorHandler} = require('../helpers/dbErrorHandler');
const { CallTracker } = require('assert');


exports.productById = (req, res, next, id)=>{
    Product.findById(id).exec((err, product)=>{
        if (err || !product){
            return res.status(400).json({
                error: 'Product not found'
            })
        }
        
        req.product = product;
        next();
    })
}

exports.read = (req, res) =>{
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.create = (req, res) => {
    console.log("Product Controller", req.body);
    let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
    form.keepExtensions = true; // what ever image type is getting extentions will be there
    form.parse(req, (err, fields, files)=>{ // parsing the form for files and fields
        if (err){
            return status(400).json({
                error:'Image could not be uploaded'
            })
        }

        // check for all fields

        const {name, description, price, category, quantity, shipping}= fields;
        if (!name || !description || !price || !category ||!quantity || !shipping){
            return res.status(400).json({
                error:'All fields are required'
            })
        }
        let product = new Product(fields);

        

        if (files.photo){
            //console.log('Files photo: ', files.photo);
            //1kb = 1000
            //1mb = 1000000
            if (files.photo.size > 1000000){
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result)=>{
            if (err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }

            //result.photo ='undefined'; // not sending the imge back
            res.json(result)
        });
    })

}

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct)=>{
        if (err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }

        res.json({
            //deletedProduct,
            "message": 'Product deleted successfully'
        })
    })
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm(); // all the form data will be available with the new incoming form
    form.keepExtensions = true; // what ever image type is getting extentions will be there
    form.parse(req, (err, fields, files)=>{ // parsing the form for files and fields
        if (err){
            return status(400).json({
                error:'Image could not be uploaded'
            })
        }

        // check for all fields

        const {name, description, price, category, quantity, shipping}= fields;
        if (!name || !description || !price || !category ||!quantity || !shipping){
            return res.status(400).json({
                error:'All fields are required'
            })
        }
        let product = req.product;
        product = lodash.extend(product, fields) // extend methode will update product by the fields came throw request
        

        if (files.photo){
            //console.log('Files photo: ', files.photo);
            //1kb = 1000
            //1mb = 1000000
            if (files.photo.size > 1000000){
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result)=>{
            if (err){
                return res.status(400).json({
                    error:errorHandler(err)
                })
            }

            res.json(result)
        });
    })

}

/**
 * sell / arrival
 * return product by sell route:
 * by sell = /products?sortyBy=sold&order=desc&limit=4
 * return product by arrival route:
 * by arrival = /products?sortyBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

 exports.list = (req, res)=>{
     let order = req.query.order ? req.query.order : 'asc';
     let sortBy = req.query.soryBy ? req.query.sortBy : '_id';
     let limit = req.query.limit ? parseInt(req.query.limit) : 6;

     Product.find()
     .select('-photo') // deselecting photo, because photo is binary data size is huge
     .populate('category')// populate category means category information about this product will be available here automaticallly, because each product has a assined category
     .sort([[sortBy, order]])
     .limit(limit)
     .exec((err, products)=>{
         if(err){
            return res.status(400).json({
                error:'Products not found'
            })
         }
         res.json(products);
         
     });
 }

 /**
  * it will find the products based on the req product category
  * other products that has the same category, will be returned, 
  * product id which came through the parameter will discard
  * @param {*} req 
  * @param {*} res 
  */

 exports.listRelated = (req, res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    Product.find({_id: {$ne: req.product}, category:req.product.category}) // ne is a oparator this will discard the product related to the _id so this query will return all other products
           .limit(limit)
           .populate('category', '_id name') // populate only certien fileds of category
           .exec((err, products)=>{
            if(err){
               return res.status(400).json({
                   error:'Products not found'
               })
            }
            res.json(products);
            
        });
}

/**
 * returning all the categories related to all products,
 * there might be some categories in the category table not reletated to product
 * distinct: is funciton which will return all the category that has ref to product table
 * @param {*} req 
 * @param {*} res 
 */
exports.listCategories = (req, res)=>{
    Product.distinct('category',{},(err, categories)=>{
        if(err){
            return res.status(400).json({
                error:'Categories not found'
            })
         }
         res.json(categories)
    })
}
/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and how the products to user based on what he wants
 * @param {*} req 
 * @param {*} res 
 */
exports.listBySearch = (req, res)=>{
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt (req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters){
        if(req.body.filters[key].length > 0){
            if (key == 'price'){
                //gte - grater than price [0-10]
                //lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            }else{
                findArgs[key] = req.body.filters[key];
            }

        }
    }

    Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data)=>{
        if(err){
            return res.status(400).json({
                error:'Products not found'
            })
         }
        res.json({
            size: data.length,
            data
        })
    })
};

exports.photo = (req, res, next)=>{
    if(req.product.photo.data){
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}

exports.listSearch = (req, res)=>{
    //create query object to hold search value and category value
    const query = {};
    //assign search value to query.name
    if (req.query.search){
        query.name = {$regex:req.query.search, $options:'i'};
        // assigne category value to query.category
        if(req.query.category && req.query.category != 'All'){
            query.category = req.query.category;
        }
        // find the product base on query object with 2 properties 
        // search and category

        Product.find(query, (err, products)=>{
            console.log(err);
            if (err){
                return res.status(400).json({
                    error: err
                })
            }
            res.json(products);
        }).select('-photo')
    }
}