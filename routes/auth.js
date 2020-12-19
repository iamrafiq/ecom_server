const express = require("express");
const router = express.Router();
const {
  signup,
  signupResponce,
  signin,
  signinWithOtp,
  signout,
  updateProfile,
  requireSignin,
  createAIUser,
} = require("../controllers/auth");
const { sendOtp } = require("../controllers/userOtp");
const {
  userSignupCondition,
  userSignupValidator,
} = require("../validator/index");

//router.post('/signup',userSignupCondition, userSignupValidator, signup);
// router.post('/signup', saveUser, sendOtp, signup);
router.post("/profile/update", updateProfile);

router.post("/signup", signup, signupResponce);
router.post("/signin", signin, sendOtp, signinWithOtp);
router.get("/signout", signout);
router.post("/ai-user", createAIUser);

// router.get('/hello', requireSignin, (req, res)=>{
//     res.send('hello there');
// })

module.exports = router;
