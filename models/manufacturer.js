const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const manufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    bengaliName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    trash: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Manufacturer", manufacturerSchema);
