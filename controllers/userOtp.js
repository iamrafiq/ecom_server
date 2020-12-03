const UserOtp = require("../models/userOtp");
const User = require("../models/user");
const axios = require("axios");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { body, validationResult } = require("express-validator");
const UserAiId = require("../models/userAiId");

exports.verify = (req, res) => {
  //find the user based on phoneNumber
  const { phoneNumber, otp } = req.body;
  UserOtp.findOne(
    {
      phoneNumber,
      otp: { $eq: otp },
      updatedAt: {
        // 5 minute ago (from now)
        $gt: new Date().getTime() - 5 * 60 * 1000,
      },
    },
    (err, userOtp) => {
      if (err || !userOtp) {
        return res.status(400).json({
          error: "OTP verification failed, please resend OTP again.",
          success: false,
        });
      }

      console.log("req.profile", req.user);
      const user = new User(req.user);
      user.verified = 1;
      user.status = 2;
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
        const {aiId} = user;
        
        UserAiId.findOne({ aiId }, (err, aiIdUser) => {
          if (err || !aiIdUser) {
            return res.status(400).json({
              error: "user not found with aiId:" + err,
            });
          }

          aiIdUser.verified = 1;
          aiIdUser.save((err, aiIdUser) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }

            res.json({
              user,
            });
          });
        });
      });
    }
  );
};

exports.otpSent = (req, res) => {
  return res.json({ otpSent: true });
};

const otpCallToServer = (req, res, next) => {
  const user = req.user;
  const { phoneNumber } = user;

  UserOtp.findOne(
    {
      phoneNumber: { $eq: phoneNumber },
    },
    (err, userOtp) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      let otp = Math.floor(1000 + Math.random() * 9000);
      console.log("send otp...before api call otp", otp);

      let smsText = `Dear customer,Your Sowdamart One Time Pin is ${otp}. It will expire in 5 minutes.`;
      let url = `https://smsapi.tsbhost.com/api/sendsms?username=${"sowdamart"}&password=${"XpAgGhT3ke"}&senderid=${"sowdamartnonmask"}&mobile=${phoneNumber}&sms=${smsText}&isunicode=0`;
      axios
        .post(encodeURI(url))
        .then((res) => {
          // console.log(`statusCode: ${res.statusCode}`);
          // console.log(res);
          console.log("send otp...after  api call");

          if (!userOtp) {
            const userOtp = new UserOtp();
            userOtp.phoneNumber = phoneNumber;
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
          // req.otp = userOtp;
          req.otpSent = true;
          next();
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            error: errorHandler(error),
          });
        });
    }
  );
};
exports.sendOtp = (req, res, next) => {
  console.log("send otp...1");
  const { newMachine } = req.body;
  const user = req.user;
  if (user.verified === 1) {
    // if verfied user want to sign in
    if (newMachine) {
      otpCallToServer(req, res, next);
    } else {
      next();
    }
  } else {
    // new user signup, unverified old user
    otpCallToServer(req, res, next);
  }
};
