const { check, body } = require("express-validator");
const Category = require("../models/Category");

const categoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .custom((input) => {
      return Category.findOne({ name: input }).then((category) => {
        if (category)
          return Promise.reject("A category with the name is already added");
      });
    }),
  body("description")
    .trim()
    .isLength({ max: 1025 })
    .withMessage("Description should be less than 1025 characters")
    .optional(),
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

module.exports = categoryValidator;
