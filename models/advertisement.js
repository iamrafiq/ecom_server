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
      type: String,
      required: true,
      unique: true,
    },
    linkType: { 
      type: Number, // 0 for category or category products, 1 - for product
      required: true,
    },
    linkSlug: { 
      type: String, // for linkType=0/1 slug of category 
      required: true,
    },
    linkProductSlug: { 
      type: String, // only for linkType=1 slug of product
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
