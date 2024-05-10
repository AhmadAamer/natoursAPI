const Review = require("../models/reviews");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appErrors");
const { json } = require("express/lib/response");
const handlerFactory = require("./handlerFactory");

exports.setUserTourId = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

{
  // exports.newReview = catchAsync(async (req, res, next) => {
  //   const review = req.body;
  //   const newReview = (await Review.create(review)).populate();
  //   res.status(200).json({
  //     status: "success",
  //     data: newReview,
  //   });
  //   next();
  // });
}

exports.getAllReviews = handlerFactory.getAll(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.newReview = handlerFactory.createOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
