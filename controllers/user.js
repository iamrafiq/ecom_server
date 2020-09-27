const User = require('../models/user');

exports.userById = (req, res, next, id)=>{
    User.findById(id).exec((err, user)=>{
        if (err || !user){
            return res.status(400).json({
                error: 'User not found'
            })
        }

        req.profile = user // adding the user object in a new object named profile and assigned it to the req object
        next();
    })
}