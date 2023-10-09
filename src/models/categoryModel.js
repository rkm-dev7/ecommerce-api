const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      unique: true,
      minlength: [3, "The length of Category name can be minimum 3 characters"],
    },
    slag: {
      type: String,
      required: [true, "Category slag is required."],
      lowercase: true,
      unique: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Category = model("Category", categorySchema);
module.exports = Category;
