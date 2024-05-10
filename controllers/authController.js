const { promisify } = require("util");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const sendEmail = require("../utils/email");
const { application } = require("express");
const { decode } = require("punycode");
const exp = require("constants");
const { appendFile } = require("fs");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_STRING, {
    expiresIn: process.env.EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24000 * 3600
    ),
    // secure: true,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; // it should remove the password from the output..
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(newUser._id);
  createSendToken(newUser, 201, res);
  // res.status(201).json({
  //   status: "success",
  //   token, // that means the client will receive his passport..
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if email and password exists
  if (!email || !password) {
    return next(new AppError("please provide email and password"));
  }
  //2)check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password");
  //to check if the password for the body is correct
  const passwordIsCorrect = await user.correctPassword(password, user.password);

  if (!user || !passwordIsCorrect) {
    return next(new AppError("incorrect email or password", 401)); // 401 status code means unauthorised..
  }

  //3)if everything is correct .. send token to the client .
  const token = signToken(user._id);
  createSendToken(user, 200, res);
});
//tell now all functions here are middleware funcions

exports.protect = catchAsync(async (req, res, next) => {
  //1)getting the token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(token);
  }
  // console.log(`token is .. ${token}`);
  if (!token) {
    return next(
      new AppError("you are not logged in .. please log in to get access.", 401)
    );
  }
  //2)verifacation of this token .. comparing it with that one would be generated from the payload & header and secret string
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_STRING
  );
  //to be clear .. method verify takes header and payload from the token and use secret to generate test signature and compare it with the signature which is in the token also..

  //3)check if user still exist
  const freshUser = await User.findById(decoded.id);
  // console.log(freshUser);

  if (!freshUser) {
    return next(new AppError("user is not exist!"));
  }

  //4)check if the user changed password after the token was issued.
  //later.

  //Grant access
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have the permission to access this route", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  // check if the user is exist ..
  if (!user)
    return next(new AppError("there is no user with this email addess", 404));
  //2)generate the randon reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPasswords/${resetToken}`;
  console.log(resetUrl);
  const message = `forgot your password ? submit a patch request to :${resetUrl} \n 
  your token will expire at ${user.passwordResetExpiredAt}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "your password reset token ",
      message,
    });
    res.status(200).json({
      status: "success",
      messag: "token sent to an email!",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "there was an error sending the email , please try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    passwordResetExpiredAt: { $gt: Date.now() },
  });
  // console.log(user);
  //2)if there is a user and token isn't expired so set the new password(which is coming from the req.body);
  if (!user)
    return next(new AppError("user is not exist or token has been expired.."));

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.passwordResetExpiredAt = undefined;
  user.save(); // pre hook for checking if confirmation is done successfully .

  // console.log(newPassword);

  //3)update changedPassword property for the user
  //4)log the user in (send jwt) :)
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token: token,
  });
});

//now we are going to implement update password middleware function ;
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get the user based on his id from req ..
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);
  if (!user) return next(new AppError("this user is not exist"));
  //2)check if current password is correct:

  if (!user.correctPassword(req.body.currentPassword, user.password))
    return next(new AppError("current password is not right ,, try again "));

  //3)update the user password :

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  console.log(user.password);
  await user.save();

  //4)log the user in :
  const token = signToken(user._id);
  createSendToken(user, 200, res);
});
