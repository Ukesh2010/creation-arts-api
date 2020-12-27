const { check } = require("express-validator");
const Category = require("../models/Category");
const Product = require("../models/Product");

const productValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .isLength({ min: 5, max: 124 })
    .withMessage("Name should be between 5 to 124 characters")
    .bail()
    .custom((input) => {
      return Product.findOne({ name: input }).then((product) => {
        if (product)
          return Promise.reject("A product with the name is already added");
      });
    }),
  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .bail()
    .isNumeric()
    .withMessage("Price should be a number")
    .bail()
    .isLength({ min: 1 })
    .withMessage("Price should be greater or equal to 1"),
  check("description")
    .trim()
    .isLength({ min: 5, max: 1024 })
    .withMessage("Description should be between 5 to 1024 characters")
    .optional(),
  check("category")
    .isUUID()
    .withMessage("Invalid category")
    .bail()
    .custom((input) => {
      return Category.findOne({ _id: input }).then((category) => {
        if (!category) {
          return Promise.reject("Invalid category");
        }
      });
    }),
  check("created_by")
    .isUUID()
    .withMessage("Invalid user id")
    .bail()
    .custom((input) => {
      return User.findById(input).then((user) => {
        if (!user) {
          return Promise.reject("Invalid user id");
        }
      });
    }),
];

module.exports = productValidator;
