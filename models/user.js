const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const addressSchema = new mongoose.Schema(
  {
    contactAddress:String,
    area: String,
    contactNumber: Number,
    contactName: String,

  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    aiId: {
      type: String,
    },
    status:{
      type: Number,
      default: 0, // 0 - ai user, 1 - signed up user,
    },
    passwordProtected:{
      type: Number,
      default: 0, // 0 - none, 1 - passwordProtected
    },
    name: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: [addressSchema],
    hashed_password: {
      type: String,
      // required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },
    // verified: {
    //   type: Number,
    //   default: 0,
    // },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

//virtual field

// userSchema
//   .virtual("password")
//   .set(function (password) {
//     this._password = password;
//     this.salt = uuidv4();
//     this.hashed_password = this.encryptPassword(password);
//   })
//   .get(function () {
//     return this._password;
//   });

// userSchema.methods = {
//   authenticate: function (plainText) {
//     return this.encryptPassword(plainText) === this.hashed_password;
//   },
//   encryptPassword: function (password) {
//     if (!password) return "";
//     try {
//       return crypto
//         .createHmac("sha1", this.salt)
//         .update(password)
//         .digest("hex");
//     } catch (err) {
//       return "";
//     }
//   },
// };

module.exports = mongoose.model("User", userSchema);
