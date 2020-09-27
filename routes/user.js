const express = require('express');
const router = express.Router();
const {signup} = require('../controllers/user');
const {userSignupCondition, userSignupValidator} = require('../validator/index');


router.post('/signup',userSignupCondition, userSignupValidator, signup);

module.exports = router;