const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const uniqueString = require("unique-string");

const Product = require("../../models/Product");
const validateProductInput = require("../../validation/products");

router.get("/", (req, res) => {
  Product.find()
    .populate("category")
    .lean()
    .then((products) => {
      const mappedProducts = products.map(({ images, ...item }) => ({
        ...item,
        images: images
          ? images.map(({ originalname, filename }) => ({
              originalFileName: originalname,
              url: `${req.protocol}://${req.get("host")}/static/${filename}`,
            }))
          : [],
      }));
      return res.json(mappedProducts);
    })
    .catch((err) => res.status(404).json({ message: err.message }));
});

router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .then((product) => res.json(product.toObject()))
    .catch((err) =>
      res.status(404).json({ message: "No product found with that ID" })
    );
});
const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, uniqueString() + path.extname(file.originalname));
    },
  }),
}).array("images", 8);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  uploadMiddleware,
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
      images: req.files,
    });

    newProduct.save().then((product) => res.json(product));
  }
);

module.exports = router;
