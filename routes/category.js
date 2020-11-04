const express = require('express');
const router = express.Router();
const {create, categoryById, categoryBySlug, read, remove, update, list, tree, children,getAllProductsOfACategory, iconMenu,  image, thumbnail} = require('../controllers/category');
const {advertisementsBySlug } = require('../controllers/advertisement');

const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/category/:categoryId',  read);
router.get('/category/products/byslug/:slug', advertisementsBySlug, categoryBySlug,  getAllProductsOfACategory);
router.get('/category/products/byid/:categoryId', getAllProductsOfACategory)

router.get('/category/children/:categoryId',  children);
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin,  create);
//router.post('/category/create:userId', requireSignin, isAuth, isAdmin, create);
//router.post('/category/create', create);
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/categories/',  list);
// router.get('/categories-with-products/',  categoriesWithProducts);

router.get('/categories/tree',  tree);
router.get(`/image`, image)

// router.get(`/images/icon-menu/:categoryId`, iconMenu)
// router.get(`/images/icon/:categoryId`, icon)
// router.get(`/images/thumbnail/:categoryId`, thumbnail)

// router.get('/category/icon/:categoryId', icon)

// router.get('/category/thumbnail/:categoryId', thumbnail)
router.param('slug', categoryBySlug);
router.param('categoryId', categoryById);
router.param('userId', userById);
router.param('slug', advertisementsBySlug);

 
module.exports = router;  