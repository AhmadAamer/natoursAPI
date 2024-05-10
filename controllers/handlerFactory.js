const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appErrors");
const APIFeatures = require("./../utils/ApiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    // console.log(doc);

    if (!doc) return next(new AppError("NO document for this ID", 404));
    res.status(204).json({
      message: "successfully delelted",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError("No document for this ID", 404));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //to allow for nested get reviews (hack);
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    //send a response
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });

//build a query
// //1A)filtering:
// const queryObj = { ...req.query }; // destructuring to get shallow copy.
// const excluded = ["page", "sort", "limit", "field"];
// excluded.forEach((el) => {
//   delete queryObj[el];
// });
// //1B)advanced filtering:
// // console.log(queryObj);
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
// // console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));
//20)sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }

// //Field limiting:
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   query = query.select("-__v");
// }
//Pagination:
// if (req.query.page || req.query.limit) {
// const page = req.query.page * 1 || 1;
// console.log(page);
// const limit = req.query.limit * 1 || 100;
// console.log(limit);
// const skip = (page - 1) * limit;
// console.log(skip);
// query = query.skip(skip).limit(limit);
// // }

// if (req.query.page) {
//   const tourNum = await Tour.countDocuments();
//   if (skip >= tourNum) throw new Error("'this page doesn't exist!");
// }
//excute a query
