const express = require("express");
const router = express.Router();
const passport = require("passport");

const Product = require("../../models/Product");
const validateProductInput = require("../../validation/products");

router.get("/", (req, res) => {
  Product.find()
    .populate("createdBy")
    .populate("category")
    .then((products) => res.json(products))
    .catch((err) => res.status(404).json({ message: "No products found." }));
});

router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .then((product) => res.json(product))
    .catch((err) =>
      res.status(404).json({ message: "No product found with that ID" })
    );
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProductInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newProduct = new Product({
      createdBy: req.user.id,
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
    });

    newProduct.save().then((product) => res.json(product));
  }
);

module.exports = router;
