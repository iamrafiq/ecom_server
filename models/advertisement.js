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
    slug: { 
      // used image url
      type: String,
      required: true,
      unique: true,
    },
    linkType: { 
      type: Number, // 0 for category or category products, 1 - for searching product
      required: true,
    },
    linkSlug: { 
      type: String, // for linkType=0 slug of category for linkType=1 search text of product
      required: true,
    },
    photo: {
      type: String,
    },
    photoBangla: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
