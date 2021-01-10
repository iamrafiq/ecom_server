const express = require('express');
const router = express.Router();
const {create, read, manufacturerById, manufacturerBySlug, remove, update, list} = require('../controllers/manufacturer');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/manufacturer/byslug/:slug', read);

router.get('/manufacturer/byid/:id', read);

router.post('/manufacturer/create/:userId', requireSignin, isAuth, isAdmin,  create);

router.delete('/manufacturer/:id/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/manufacturer/:id/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/manufacturer/all/list',  list);

router.param('slug', manufacturerBySlug);
router.param('id', manufacturerById);
router.param('userId', userById);

 
module.exports = router;  