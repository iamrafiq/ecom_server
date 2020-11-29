const UserOtp = require("../models/userOtp");
const User = require("../models/user");
const axios = require("axios");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { body, validationResult } = require("express-validator");

exports.verify = (req, res) => {
  //find the user based on userId
  const { userId, otp } = req.body;
  UserOtp.findOne(
    {
      userId,
      otp: { $eq: otp },
      updatedAt: {
        // 5 minute ago (from now)
        $gt: new Date().getTime() - 5* 60 * 1000,
      },
    },
    (err, userOtp) => {
      if (err || !userOtp) {
        return res.status(400).json({
          error: "OTP verification failed, please resend OTP again.",
          success: false,
        });
      }

      console.log("req.profile", req.profile);
      const user = new User(req.profile);
      user.verified = 1;
      console.log("user...", user);

      user.save((err, user) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        console.log("saved user: ", user);
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
          user,
        });
      });
    }
  );
};

exports.otpSent = (req, res) => {
  return res.json({ success: true });
};

exports.sendOtp = (req, res, next) => {
  const { userId } = req.body;
  UserOtp.findOne(
    {
      userId: { $eq: userId },
    },
    (err, userOtp) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      let otp = Math.floor(1000 + Math.random() * 9000);
      let smsText = `Dear customer,Your Sowdamart One Time Pin is ${otp}. It will expire in 5 minutes.`;
      let url = `https://smsapi.tsbhost.com/api/sendsms?username=${"sowdamart"}&password=${"XpAgGhT3ke"}&senderid=${"sowdamartnonmask"}&mobile=${userId}&sms=${smsText}&isunicode=0`;
      axios
        .post(encodeURI(url))
        .then((res) => {
          // console.log(`statusCode: ${res.statusCode}`);
          // console.log(res);
          if (!userOtp) {
            const userOtp = new UserOtp();
            userOtp.userId = userId;
            //send otp
            userOtp.otp = otp;
            // console.log(userOt)
            userOtp.save((err, userOtp) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }
            });
          } else {
            userOtp.otp = otp;
            userOtp.save((err, userOtp) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err),
                });
              }
            });
          }
          req.otp = userOtp;
          next();
        })
        .catch((error) => {
          console.log(error)
          return res.status(400).json({
            error: errorHandler(error),
          });
        });
    }
  );
};
