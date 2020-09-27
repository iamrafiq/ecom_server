const express = require('express');
const router = express.Router();
const {signup, signin, signout} = require('../controllers/user');
const {userSignupCondition, userSignupValidator} = require('../validator/index');


router.post('/signup',userSignupCondition, userSignupValidator, signup);
router.post('/signin', signin);
router.post('/signout', signout);

module.exports = router;