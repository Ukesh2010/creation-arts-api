const Validator = require("validator");
const validText = require("./valid-text");

module.exports = function validateProductInput(data) {
  let errors = {};

  data.name = validText(data.name) ? data.name : "";

  if (!Validator.isLength(data.name, { min: 5, max: 140 })) {
    errors.name = "Product must be between 5 and 140 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (!data.price) {
    errors.price = "Price field is required";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
