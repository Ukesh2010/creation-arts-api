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
    .custom((input, meta) => {
      return Product.findOne({
        name: input,
        _id: { $ne: meta.req.params.id },
      }).then((product) => {
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
  check("category").custom((input) => {
    return Category.findOne({ _id: input }).then((category) => {
      if (!category) {
        return Promise.reject("Invalid category");
      }
    });
  }),
];

module.exports = productValidator;
