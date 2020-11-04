const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    slugPages: [
      {
        type: String
      },
    ],
    photo: {
      url: String,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
