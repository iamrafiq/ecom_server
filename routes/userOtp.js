const express = require("express");
const router = express.Router();
const { verify, sendOtp, otpSent } = require("../controllers/userOtp");
const { findUserByUserId } = require("../controllers/user");

router.post("/verfiy-otp/", findUserByUserId, verify);
router.post("/resend-otp/", sendOtp, otpSent);

module.exports = router;
