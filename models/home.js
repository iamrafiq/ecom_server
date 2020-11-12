const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const homeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 64,
      unique: true,
    },
    bengaliTitle: {
      type: String,
      trim: true,
      required: true,
      maxlength: 64,
      unique: true,
    },
    advertisements: [
      {
        // loaded advetisement through middleware from advertisment table by home slug
        type: Object,
      },
    ],
    offerProducts:{
      type: Object,
    },
    categories:{
      type: Object,
    },
    userComments: [
      {
        // using middleware loaded first five comments from user comments table sort by comment sort logic by comment model
        type: Object,
      },
    ],
    photoLanding: {
      type: String,
    },
    photoTutorial: [
      {
        type: String,
      },
    ],
    photoTutorialBengali: [
      {
        type: String,
      },
    ],
    gallery: [
      {
        idG:String,
        photoG: String,
        titleG: String,
        shortDescriptionG: String,
        titleBanglaG: String,
        shortDescriptionBanglaG: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Home", homeSchema);
