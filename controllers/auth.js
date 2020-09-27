const  User = require('../models/user');
const {errorHandler} = require('../helpers/dbErrorHandler');
const jwt = require('jsonwebtoken');// to generate signin token
const expressJwt = require('express-jwt')// for authorization check
const { body, validationResult } = require('express-validator');
const user = require('../models/user');

exports.signup = (req, res) => {
    console.log('req.body',req.body);
    
    const user = new User(req.body);
    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                err:errorHandler(err)
            })
        }

        user.salt = undefined;
        user.hashed_password = undefined;

        res.json({
            user
        })
    });
};  


exports.signin = (req, res)=>{
    //find the user based on email
    const {email, password} = req.body;
    User.findOne({email},(err, user)=>{
        if (err || !user){
            return res.status(400).json({
                error: 'User with that email dose not exist. Please signup'
            })
        }

        //const user = new User;
    //user.purr();
    // if user is is found make sure email and password matched
    //Create authenticate method in user model
    //user1 = new User;
    if (!user.authenticate(password)){
        return res.status(401).json({
            error: 'Email or Password not matched'
        })
    }
    //generate a signed token with user id and secrate
    const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET);
    // persist the token as 't' in cookie with expriy date 
    res.cookie('t', token, {expire: new Date() + 9999}) ; // here 9999 in seconds
    // Now return response with user and token to frontend client
    const {_id, name, role} = user;
    return res.json({token, user:{_id, name, email, role}});

    });
}
exports.signout = (req, res)=>{
    res.clearCookie('t');
    res.json({
        message:'Signout successfully'
    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth", // all user property will be accessiable by auth object
  });

  exports.isAuth = (req, res, next) =>{
      let user = req.profile && req.auth && req.profile._id == req.auth._id;
      if (!user){
          return res.status(403).json({
              error: 'Access denied.'
          });
      }

      next();
  };

  exports.isAdmin = (req, res, next)=>{
      if (req.profile.role == 0){ // role 0 is for regular user, not for admin
          return res.status(403).json({
              error:'Admin resourse! Access denied'
          })
      }
      next();
  };