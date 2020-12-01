const express = require("express");
const router = express.Router();
const { verify, sendOtp, otpSent } = require("../controllers/userOtp");
const { findUserByPhoneNumber } = require("../controllers/user");

router.post("/verfiy-otp/", findUserByPhoneNumber, verify);
router.post("/resend-otp/", findUserByPhoneNumber, sendOtp, otpSent);

module.exports = router;
