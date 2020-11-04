
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.photo = (req, res) => {
    console.log("image call");
    let pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${req.query.name}`;
    fs.readFile(pathToLocalStorage, (err, imageData) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      // res.writeHead(200, {
      //   "Content-Type": "image/webp",
      // });
      res.end(imageData);
    });
  };