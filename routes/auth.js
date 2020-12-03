const express = require('express');
const router = express.Router();
const {saveUser, signup, pullUser, signin, signout, requireSignin, createAIUser} = require('../controllers/auth');
const {sendOtp} = require('../controllers/userOtp');
const {userSignupCondition, userSignupValidator} = require('../validator/index');


//router.post('/signup',userSignupCondition, userSignupValidator, signup);
// router.post('/signup', saveUser, sendOtp, signup);
router.post('/signup', saveUser, signup);

router.post('/signin', pullUser, sendOtp, signin);
router.get('/signout', signout);
router.post('/ai-user', createAIUser);



// router.get('/hello', requireSignin, (req, res)=>{
//     res.send('hello there');
// })

module.exports = router;  