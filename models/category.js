const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
    },
    parent: { type: ObjectId, ref: "Category" },
    children:{
      type: Object
    },
    products:[{type:ObjectId, ref:"Product"}],
    icon: {
      data: Buffer,
      contentType: String,
    },
    thumbnail: {
      data: Buffer,
      contentType: String,
    },
    order: {
      type: Number,
    },

    trash: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

/*
const autoPopulateChildren = function (next) {
  this.populate("childs", "-icon -thumbnail");
  this.where({ trash: false });
  next();
};

categorySchema
  .pre("findOne", autoPopulateChildren)
  .pre("find", autoPopulateChildren);*/


// categorySchema.pre("remove", function (next) {
//   // Remove all the assignment docs that reference the removed person.
//   this.model("Category").remove({ childs: this._id }, next);
// });


// categorySchema.pre('deleteOne', function (next) {
//     const categoryId = this.getQuery()["_id"];
//     mongoose.model("Category").deleteMany({'childs': categoryId}, function (err, result) {
//       if (err) {
//         console.log(`[error] ${err}`);
//         next(err);
//       } else {
//         console.log('success');
//         next();
//       }
//     });
//   });



module.exports = mongoose.model("Category", categorySchema);
