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
  res.writeHead(200, {
    "Content-Type": "image/webp",
  });
  // res.set({'Content-Type': 'image/*'});
  res.end(req.imageData);
};
exports.photoByFileName = (req, res, next, fileName) => {
  //req.query.res = low / medium / high
  //req.query.p = p1 / p2/ p3/ p4/op1 /op2 / op3/op4 /i /mi/ t / bah
  //req.query.ext = "webp/jpg/png/..."
  let pathToLocalStorage = `${process.env.CLIENT_NAME}/images/${req.query.res}/${req.query.p}/${fileName}.${req.query.ext}`;
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
