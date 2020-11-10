const express = require('express');
const router = express.Router();
const {create, read, update, homeById, getHome} = require('../controllers/home');
const {advertisementsBySlug } = require('../controllers/advertisement');


const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

// router.get('/:slug',  read);
router.get('/:slug',  getHome);

router.post('/home/create/:userId', requireSignin, isAuth, isAdmin,  create);
router.put('/home/:homeId/:userId', requireSignin, isAuth, isAdmin, update);

router.param('homeId', homeById);
router.param('userId', userById);
router.param('slug', advertisementsBySlug);

 
module.exports = router;  