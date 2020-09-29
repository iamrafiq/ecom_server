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

exports.read = (req, res) =>{
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

/**
 * findOneAndUpdate will find the User object by using req.profile._id
 * then it will set all new infromation came through the req.body
 * {new: true} means newly updated record will be sent as responce
 * @param {*} req 
 * @param {*} res 
 */
exports.update = (req, res)=>{
    User.findOneAndUpdate(
        {_id:req.profile._id},
        {$set: req.body}, 
        {new: true},
        (err, user)=>{
            if (err){
                return res.status(400).json({
                    error: 'You are not authorized to perfrom this action'
                })
            }

            user.hashed_password = undefined;
            user.salt = undefined;
            res.json(user);
        })
}