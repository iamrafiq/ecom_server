const User = require("../models/user");
const {Order} = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    req.profile = user; // adding the user object in a new object named profile and assigned it to the req object
    next();
  });
};

exports.findUserByUserId = (req, res, next) => {
  const {userId} = req.body;
  console.log("findUserByUserId", req.body)
  User.findOne({userId:{$eq:userId}}).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    req.profile = user; // adding the user object in a new object named profile and assigned it to the req object
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

/**
 * findOneAndUpdate will find the User object by using req.profile._id
 * then it will set all new infromation came through the req.body
 * {new: true} means newly updated record will be sent as responce
 * @param {*} req
 * @param {*} res
 */
// exports.update = (req, res) => {
//   console.log(req.body)
//   User.findOneAndUpdate(
//     { _id: req.profile._id },
//     { $set: req.body },
//     { new: true },
//     (err, user) => {
//       if (err) {
//         return res.status(400).json({
//           error: "You are not authorized to perfrom this action",
//         });
//       }

//       user.hashed_password = undefined;
//       user.salt = undefined;
//       console.log(user)
//       res.json(user);
//     }
//   );
// };
exports.update = (req, res) => {
   console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
  const { name, password } = req.body.user;

  User.findOne({ _id: req.profile._id }, (err, user) => {
      if (err || !user) {
          return res.status(400).json({
              error: 'User not found'
          });
      }
      if (!name) {
          return res.status(400).json({
              error: 'Name is required'
          });
      } else {
          user.name = name;
      }

      if (password) {
          if (password.length < 6) {
              return res.status(400).json({
                  error: 'Password should be min 6 characters long'
              });
          } else {
              user.password = password;
          }
      }

      user.save((err, updatedUser) => {
          if (err) {
              console.log('USER UPDATE ERROR', err);
              return res.status(400).json({
                  error: 'User update failed'
              });
          }
          updatedUser.hashed_password = undefined;
          updatedUser.salt = undefined;
          res.json(updatedUser);
      });
  });
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];
  console.log("order req.body", req.body);
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data)=>{
        if (error) {
            return res.status(400).json({
                error: 'Could not update user purchase history'
            })
        }

        next();
    }
  );
};


exports.purchaseHistory = (req, res) =>{
  console.log("purches history")
  Order.find({user:req.profile._id})
  .populate('user', '_id name')
  .sort('-created')
  .exec((error, orders)=>{
    if (error){
      return res.status(400).json({
        error:errorHandler(error)
      })
    }
    res.json(orders)
  })
}