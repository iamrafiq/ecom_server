const formidable = require('formidable'); // for uploading image
const lodash=require('lodash'); // for uploading image
const fs = require('fs');
const Product = require('../models/product');
const {errorHandler} = require('../helpers/dbErrorHandler');


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