const Category = require('../models/category');
const lodash=require('lodash'); // for updating fields
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.create = (req, res) => {
    console.log("Category Controller", req.body);
    const category = new Category(req.body);
    category.save((err, data)=>{
        if (err){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }

        res.json({data});
    })
}


exports.categoryById = (req, res, next, id)=>{
    Category.findById(id).exec((err, category)=>{
        if (err || !category){
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        req.category = category ;
        next();
    })
}

exports.read = (req, res)=>{
    return res.json(req.category);
}

exports.remove = (req, res) => {
    let category = req.category;
    category.remove((err, deletedCategory)=>{
        if (err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }

        res.json({
            //deletedCategory,
            "message": 'Category deleted successfully'
        })
    })
}

exports.update = (req, res) => {
    const category = req.category;
    category.name = req.body.name;
    category.save((err, data)=>{
        if (err){
            return res.status(400).json({
                error: "Category dose not exist."
            })
        }

        res.json({data});
    })
}


exports.list = (req, res)=>{
    Category.find().exec((err, data)=>{
        if (err){
            return res.status(400).json({
                error:errorHandler(err)
            })
        }

        res.json(data); 
    })
}