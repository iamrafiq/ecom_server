const express = require("express");
const router = express.Router();
const { photo, photoByFileName } = require("../controllers/photo");

/**
 * router.get(`/image/:fileName`, photo); 
 * 
 * `/image/:fileName`
 * 
 * this structure not not change able because in the data base save images in this formate 
 * http://ubuntu-Inspiron-5593:8001/api/image/abc.webp?p=p1
 * 
 * and while deleting using 
 * pathname: '/api/image/adaddadad-zxczxcasdad.webp', with a fixed array index, in the unliking of product images while deleting 
 * updaing an image 
 * 
 *  var parts = url.parse(photoUrl, true);
    let pathModule = parts.pathname.split("/");
    let fileName = pathModule[pathModule.lenght - 1];
 * 
 */
router.get(`/image/:fileName`, photo); 

router.param("fileName", photoByFileName);

module.exports = router;
