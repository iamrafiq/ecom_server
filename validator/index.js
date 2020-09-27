
const { body, validationResult } = require('express-validator');
exports.userSignupCondition =  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Email must be between 3 to 32 characters')
    .matches(/^\S+@\S+\.\S+$/)
    .withMessage('Invalid email address')
    .isLength({
        min:4,
        max:32
    }),
    body('password', 'Password is required').notEmpty(),
    body('password')
    .isLength({min:6})
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
  ];
exports.userSignupValidator = (req, res, next)=>{
 
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      //return res.status(400).json({ errors: errors.array() });
      const firstError = errors.array().map(error=>`${error.msg}`)[0]
      return res.status(400).json({error:firstError});
 
    }
    next();
}