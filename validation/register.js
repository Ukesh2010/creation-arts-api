const { body } = require("express-validator");

const registerValidator = [
  body("role").not().isEmpty().isIn(["admin", "customer"]),
  body("email")
    .isEmail()
    .normalizeEmail()
    .custom((input) => {
      return User.findOne({ email: input }).then(() => {
        return Promise.reject(
          "A user has already registered with this address"
        );
      });
    }),
  body("password").isLength({ min: 8 }),
  body("password2").custom((input, meta) => {
    if (meta.req.body.password === input) {
      return true;
    }

    return false;
  }),
];

module.exports = registerValidator;
