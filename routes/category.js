const express = require('express');
const router = express.Router();
const {create, categoryById, categoryBySlug, read, remove, update, list,categoriesWithProducts, tree, children,items, getAllProducts,  icon, thumbnail} = require('../controllers/category');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/category/:categoryId',  read);
router.get('/category/items/:slug', categoryBySlug,  items);

router.get('/category/children/:categoryId',  children);
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin,  create);
//router.post('/category/create:userId', requireSignin, isAuth, isAdmin, create);
//router.post('/category/create', create);
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/categories/',  list);
router.get('/categories-with-products/',  categoriesWithProducts);

router.get('/categories/tree',  tree);
router.get('/category/icon/:categoryId', icon)
router.get('/category/products/:categoryId', getAllProducts)

router.get('/category/thumbnail/:categoryId', thumbnail)

router.param('slug', categoryBySlug);
router.param('categoryId', categoryById);
router.param('userId', userById);

 
module.exports = router;  