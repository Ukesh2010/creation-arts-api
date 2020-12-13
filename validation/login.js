const { body } = require("express-validator");

const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").not().isEmpty(),
];

module.exports = loginValidator;
