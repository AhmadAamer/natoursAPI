const mongoose = require("mongoose");
const slugify = require("slugify");
// const users = require("../models/usersModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "u've to enter the tour name 😎"],
      unique: true,
    },
    slugs: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a mgs"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty.."],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price .."],
    },
    ratingAverage: { type: Number, default: 4.5 },
    ratingquantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A tour must have a discription"],
    },
    imageCover: {
      type: String,
      required: [false, "A tour must have an imageCover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocaion: {
      type: {
        type: String,
        default: "point",
        enum: ["point"],
      },
      address: String,
      coordinates: [Number],
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        address: String,
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Review",
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.virtual("durationInWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

//this code is responsible for denormalizing (embidding)
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(
//     async (id) => await users.findById(id)
//   ); // it will return array of promises
//   const guides = await Promise.all(guidesPromises);
//   this.guides = guides;
//   next();
// });

tourSchema.pre(/^find/, function () {
  this.populate({
    path: "guides",
    select: "-__v",
  });
});

tourSchema.pre("save", function (next) {
  // console.log(this); //this keyword refers to the document that is posted..
  this.slugs = slugify(this.name, { lower: true });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
