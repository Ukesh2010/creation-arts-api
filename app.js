const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const categories = require("./routes/api/categories");
const products = require("./routes/api/products");

app.use("/static", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
require("./config/passport")(passport);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to creation arts api" });
});

app.use("/api/users", users);
app.use("/api/categories", categories);
app.use("/api/products", products);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const mongoose = require("mongoose");
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.log(err));
