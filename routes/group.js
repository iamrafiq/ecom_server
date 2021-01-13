const express = require('express');
const router = express.Router();
const {create, read, groupById, groupBySlug, remove, update, list} = require('../controllers/group');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');
const {advertisementsByGroupId } = require('../controllers/advertisement');
const {productsByGroup } = require('../controllers/product');

router.get('/group/byslug/:slug', read);

router.get('/group/byid/:id', read);

router.post('/group/create/:userId', requireSignin, isAuth, isAdmin,  create);
router.get("/products/by/group-slug/:slug", advertisementsByGroupId, productsByGroup);

router.delete('/group/:id/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/group/:id/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/group/all/list',  list);

router.param('slug', groupBySlug);
router.param('id', groupById);
router.param('userId', userById);

 
module.exports = router;  