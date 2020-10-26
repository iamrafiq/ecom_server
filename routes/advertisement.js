const express = require('express');
const router = express.Router();
const {create, advertisementsBySlug , read, advertisementById,  remove, update, list} = require('../controllers/advertisement');
const {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const {userById} = require('../controllers/user');

router.get('/advertisements/:advertisementSlug', read);

router.get('/advertisement/:advertisementId', read);

router.post('/advertisement/create/:userId', requireSignin, isAuth, isAdmin,  create);

router.delete('/advertisement/:advertisementId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/advertisement/:advertisementId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/advertisements/',  list);


router.param('advertisementSlug', advertisementsBySlug);
router.param('advertisementId', advertisementById);
router.param('userId', userById);

 
module.exports = router;  