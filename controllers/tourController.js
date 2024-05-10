const fs = require("fs");
const catchAsync = require("./../utils/catchAsync");
const { json } = require("express/lib/response");
const Tour = require("./../models/tourModel");
const { request } = require("../app");
const AppError = require("../utils/appErrors");
const handlerFactory = require("./handlerFactory");
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     res.status(404).json({
//       status: "fail",
//       message: "messing name or price !!",
//     });
//   }
//   next();
// };
// exports.chekId = (req, res, next, val) => {
//   console.log(`tour id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "fail",
//       message: "invalid ID",
//     });
//   }
//   next();
// };

//Handlers:
// console.log(Tour.find());

exports.getTopCheap = (req, res, next) => {
  req.query.sort = "-ratingAverage,price";
  // req.query.fields = "price,ratingAverage";
  req.query.limit = "5";
  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: "reviews" });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //*1 to convert it into number.
  const plan = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan: plan,
    },
  });
});

exports.createTour = handlerFactory.createOne(Tour);

exports.updateTour = handlerFactory.updateOne(Tour);

exports.deleteTour = handlerFactory.deleteOne(Tour);
