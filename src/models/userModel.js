const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultImagePath } = require("../secret");

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "The length of user name can be minimum 3 characters"],
      maxlength: [31, "The length of user name can be maximum 31 characters"],
      required: [true, "User name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required."],
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          );
        },
        // message: (props) => `${props.value} is not a valid email address!`,
        message: "Please enter a valid email.",
      },
    },
    password: {
      type: String,
      minlength: [8, "The length of password can be minimum 8 characters"],
      required: [true, "password is required"],
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
      validate: {
        validator: function (v) {
          return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,10}$/.test(
            v
          );
        },
        message:
          "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character",
      },
    },
    image: {
      type: Buffer,
      contentType: String,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      validate: {
        validator: function (v) {
          return /^(?:\+88|88)?(01[3-9]\d{8})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBaned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userSchema);
module.exports = User;
