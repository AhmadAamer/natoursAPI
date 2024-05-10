const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "you have to enter your name"],
  },
  email: {
    type: String,
    required: [true, "missing email"],
    unique: true,
    validate: [validator.isEmail, "invalid email"],
    lowercase: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ["admin", "user", "guide", "lead-guide"],
    default: "user",
    // required: [true, "enter your role"],
  },
  password: {
    type: String,
    minlenth: 8,
    required: [true, "you have to enter your password"],
    select: false, // to not be shown in any output..
  },
  passwordConfirm: {
    type: String,
    required: [true, "confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not the same!",
    },
  },
  resetPasswordToken: String, //it's the encrypted one
  passwordResetExpiredAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//instance method:
userSchema.methods.correctPassword = async (
  passwordFromBody,
  passwordFromDB
) => {
  return await bcrypt.compare(passwordFromBody, passwordFromDB);
};

//toDo .. instancd method to check if the password changed after getting the token .

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(
    { resetToken },
    ` and resetPasswordToken is ${this.resetPasswordToken}`
  );
  this.passwordResetExpiredAt = Date.now() + 10 * 1000 * 60;
  return resetToken;
};
userSchema.pre("save", async function (next) {
  // to make sure that password is modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
