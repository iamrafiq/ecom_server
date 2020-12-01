const express = require('express');
const router = express.Router();
const {saveUser, signup, pullUserUsingPhoneNumber, signin, signout, requireSignin} = require('../controllers/auth');
const {sendOtp} = require('../controllers/userOtp');
const {userSignupCondition, userSignupValidator} = require('../validator/index');


//router.post('/signup',userSignupCondition, userSignupValidator, signup);
// router.post('/signup', saveUser, sendOtp, signup);
router.post('/signup', saveUser, signup);

router.post('/signin', pullUserUsingPhoneNumber, sendOtp, signin);
router.get('/signout', signout);


// router.get('/hello', requireSignin, (req, res)=>{
//     res.send('hello there');
// })

module.exports = router;  