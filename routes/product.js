const express = require('express');
const router = express.Router();
const {create, productById, read, 
    remove, update,list, listRelated,
    listCategories, listBySearch, photo, listSearch, productsByCategoryId, getAllProducts} = require('../controllers/product');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');
const {categoryById} = require('../controllers/category');
    

router.get('/product/:productId', read);
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin,  create);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/products', list);
router.get('/allproducts', getAllProducts);
router.get('/products/search', listSearch)
router.get('/products/by/category/:categoryId', productsByCategoryId)
router.get('/products/related/:productId', listRelated)
router.get('/products/categories', listCategories) 
/**
 * router.post('/products/by/search', listBySearch)
 * Though bellow rout returns product but we used post because to filter the products   we will be sending object
 * through the request body such as category, price range etc.
 * 
 * To access the request body we need to use post method
 */
router.post('/products/by/search', listBySearch)
router.get('/product/photo/:productId', photo)


router.param('userId', userById);
router.param('productId', productById);



module.exports = router;  