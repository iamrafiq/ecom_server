const express = require('express');
const router = express.Router();
const {create, remove,  read, update, homeById, getHome} = require('../controllers/home');

const {advertisementsByHomeSlug } = require('../controllers/advertisement');
const {tree } = require('../controllers/category');
const {getOfferProducts } = require('../controllers/product');


const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/:slug',  getHome);

router.post('/home/create/:userId', requireSignin, isAuth, isAdmin,  create);
router.put('/home/:homeId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/home/delete/:homeId/:userId', requireSignin, isAuth, isAdmin, remove);

router.param('homeId', homeById);
router.param('userId', userById);
router.param("slug",advertisementsByHomeSlug);
router.param("slug",getOfferProducts);
router.param("slug",tree);

 
module.exports = router;  