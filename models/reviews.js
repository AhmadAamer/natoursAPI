const mongoose = require("mongoose");
const slugify = require("slugify");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "you need to write a review"],
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
    },
    crearedAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belongs to a tour!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function () {
  // this.populate({
  //   path: "tour",
  //   select: "name -guides",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });
  this.populate({ path: "user", select: "name" });
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
