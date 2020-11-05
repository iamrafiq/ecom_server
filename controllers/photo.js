const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");

// exports.photo = (req, res) => {
//   console.log("image call");
//   let pathToLocalStorage = "";
//   if (req.w) {
//     pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${w}/${req.query.name}`;
//   } else {
//     pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${req.query.name}`;
//   }
//   fs.readFile(pathToLocalStorage, (err, imageData) => {
//     if (err) {
//       return res.status(400).json({
//         error: errorHandler(err),
//       });
//     }
//     // res.writeHead(200, {
//     //   "Content-Type": "image/webp",
//     // });
//     res.end(imageData);
//   });
// };

exports.photo = (req, res) => {
  // res.writeHead(200, {
  //   "Content-Type": "image/webp",
  // });
  res.end(req.imageData);
};
exports.photoByFileName = (req, res, next, fileName) => {
  let pathToLocalStorage = "";
  if (req.r) {
    pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${req.r}/${fileName}`;
  } else {
    pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${fileName}`;
  }
  fs.readFile(pathToLocalStorage, (err, imageData) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    req.imageData = imageData;
    next();
  });
};
