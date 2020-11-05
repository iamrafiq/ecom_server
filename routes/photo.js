const express = require("express");
const router = express.Router();
const { photo, photoByFileName } = require("../controllers/photo");

router.get(`/image/:fileName`, photo);

router.param("fileName", photoByFileName);

module.exports = router;
