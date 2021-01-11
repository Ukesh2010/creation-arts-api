if (process.env.NODE_ENV === "production") {
  module.exports = require("./production/email");
} else {
  module.exports = require("./dev/email");
}
