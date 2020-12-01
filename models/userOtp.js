const mongoose = require('mongoose');

const userOTPSchema = new mongoose.Schema({
    phoneNumber:{
        type:String,
        trim: true,
        maxlength:32
    },
    otp:{
        type:String,
        trim: true,
        required: true,
        unique:true
    },
}, {timestamps:true});

module.exports = mongoose.model("UserOtp", userOTPSchema); 