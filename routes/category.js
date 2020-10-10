const express = require('express');
const router = express.Router();
const {create, categoryById, read, remove, update, list,tree,  icon, thumbnail} = require('../controllers/category');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/category/:categoryId',  read);
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin,  create);
//router.post('/category/create:userId', requireSignin, isAuth, isAdmin, create);
//router.post('/category/create', create);
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/categories/',  list);
router.get('/categories/tree',  tree);
router.get('/category/icon/:categoryId', icon)
router.get('/category/thumbnail/:categoryId', thumbnail)

router.param('categoryId', categoryById);
router.param('userId', userById);

 
module.exports = router;  