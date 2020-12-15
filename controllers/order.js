const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const axios = require("axios");

exports.orderById = (req, res, next, id) => {
  console.log("order by id");
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((error, order) => {
      if (error || !order) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      req.order = order;
      console.log("req.order1", req.order)
      next();   

    });
};
exports.create = (req, res) => {
  //  console.log('create order', JSON.parse(req.body.order.products))
  console.log("create order user", req.profile);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  console.log("order ppp", order);
  order.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error),
      });
    }

    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name address phoneNumber")
    .sort("-createdAt")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      res.json(orders);
    });
};

exports.orderDetails = (req, res) => {
  console.log("req.ordddder", req.order);
  if (req.order) {
    res.json(req.order);
  }else{
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

exports.getStatusValues = (req, res) => {
  console.log("eeeee", Order.schema.path("status").enumValues);
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (error, order) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }
      let smsText = `Dear customer,Your Sowdamart order has been ${req.body.status }. Thank you for shopping`;
      console.log("order contact number:", req.order.contactNumber)
      let url = `https://smsapi.tsbhost.com/api/sendsms?username=${"sowdamart"}&password=${"XpAgGhT3ke"}&senderid=${"sowdamartnonmask"}&mobile=${req.order.contactNumber}&sms=${smsText}&isunicode=0`;
      axios
        .post(encodeURI(url))
        .then((res1) => {

          console.log("order sms change")
          res.json(order);

          // console.log(`statusCode: ${res.statusCode}`);
          // console.log(res);

          // if (!userOtp) {
          //   const userOtp = new UserOtp();
          //   userOtp.phoneNumber = phoneNumber;
          //   //send otp
          //   userOtp.otp = otp;
          //   // console.log(userOt)
          //   userOtp.save((err, userOtp) => {
          //     if (err) {
          //       return res.status(400).json({
          //         error: errorHandler(err),
          //       });
          //     }
          //   });
          // } else {
          //   userOtp.otp = otp;
          //   userOtp.save((err, userOtp) => {
          //     if (err) {
          //       return res.status(400).json({
          //         error: errorHandler(err),
          //       });
          //     }
          //   });
          // }
          // req.otp = userOtp;
        })
        .catch((error) => {
          console.log(error);
          order.smsError = error;
          res.json(order);
        });

    }
  );
};
