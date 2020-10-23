const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
    },
    bengaliName: {
      type: String,
      trim: true,
    },
    nameWithOutSubText: {
      type: String,
      trim: true,
    },
    subText: {
      type: String,
      trim: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    cropPrice: {
      type: Number,
      required: true,
    },
    applyDiscounts: {
      type: Number,
      default: 0,
    },
    blockSale: {
      type: Number,
      default: 0,
    },
    
    isAlwaysAvailable: {
      type: Number,
      default: 0,
    },
    commonStock: {
      type: Number,
      default: 0,
    },
    preferredStock: {
      type: Number,
      default: 0,
    },
    blockAtWarehouse: {
      type: Number,
      default: 0,
    },
    isPerishable: {
      type: Number,
      default: 0,
    },
    thirdPartyItem: {
        type: Number,
        default: 0,
      },
    earliestAvailabilityTime: {
      type: String,
      trim:true
    },
    availabilityCutOffTime: {
      type: String,
      trim:true
    },
 
      shortDesc: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      longDesc: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    photosUrl: [
      {
        type: String,
        trim: true,
      },
    ],
    offerPhotosUrl: [
      {
        type: String,
        trim: true,
      },
    ],
    categories: [
      {
        type: ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    recursiveCategories: [
        {
          type: ObjectId,
          ref: "Category",
          required: true,
        },
      ],
    manufacturers: [
      {
        type: ObjectId,
        ref: "Manufacturer",
      },
    ],
    shipping: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
