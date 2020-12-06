const UserOtp = require("../models/userOtp");
const User = require("../models/user");
const axios = require("axios");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { body, validationResult } = require("express-validator");
const UserAiId = require("../models/userAiId");
const jwt = require("jsonwebtoken"); // to generate signin token
const expressJwt = require("express-jwt"); // for authorization check

exports.verify = (req, res) => {
  //find the user based on phoneNumber
  const { phoneNumber, otp, aiId } = req.body;

  console.log("veryfiing aid requested:", aiId);
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
        User.findOne(
          { aiId: { $eq: aiId }, phoneNumber: { $eq: null } },
          (err, userTemp) => {
            if (err) {
              return res.status(400).json({
                error:
                  "OTP verification failed, please resend OTP again.",
                success: false,
              });
            }
            if (userTemp) {
              userTemp
                .remove()
                .then((result) => {
                  sendResponce(res, user);
                })
                .catch((error) => {
                  return res.status(400).json({
                    error: errorHandler(err),
                  });
                });
            } else {
              sendResponce(res, user);
            }
          }
        );
      });
    }
  );
};

const sendResponce = (res, user) => {
  const {
    _id,
    name,
    phoneNumber,
    role,
    aiId,
    passwordProtected,
    status,
  } = user;

  const verified = 1;
  const token = generateToken(res, user);

  res.json({
    token,
    user: {
      _id,
      name,
      verified,
      phoneNumber,
      role,
      aiId,
      passwordProtected,
      status,
    },
  });
};
const generateToken = (res, user) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  // persist the token as 't' in cookie with expriy date
  res.cookie("t", token, { expire: new Date() + 9999 }); // here 9999 in seconds
  // Now return response with user and token to frontend client
  return token;
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
          req.user = user;
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
  otpCallToServer(req, res, next);
};
