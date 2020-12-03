const mongoose = require('mongoose');

const userAiIdSchema = new mongoose.Schema({
    userId:{  // phone number email whatever used for user signup
        type:String,
        trim: true,
    },
    aiId:{
        type:String,
    },
    verified:{
        type:String,
    },
    
}, {timestamps:true});

module.exports = mongoose.model("UserAiId", userAiIdSchema); 