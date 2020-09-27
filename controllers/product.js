const formidable = require('formidable'); // for uploading image
const _=require('lodash'); // for uploading image
const fs = require('fs');
const Product = require('../models/product');
const {errorHandler} = require('../helpers/dbErrorHandler');


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

        let product = new Product(fields);

        if (files.photo){
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