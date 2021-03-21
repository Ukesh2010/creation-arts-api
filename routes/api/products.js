const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const uniqueString = require("unique-string");

const Product = require("../../models/Product");
const { isAdmin } = require("../../middlewares/role");
const productValidator = require("../../validation/products");
const validate = require("../../validation/validate");

const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
      cb(null, uniqueString() + path.extname(file.originalname));
    },
  }),
}).array("images", 8);

router.get("/", (req, res) => {
  const query = {};

  const { isFeatured, limit } = req.query;

  if (isFeatured) {
    query.isFeatured = isFeatured;
  }

  Product.find(query)
    .sort({ createdAt: "desc" })
    .limit(limit ? Number(limit) : undefined)
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

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .lean();
    if (product) {
      const { images, ...item } = product;
      res.json({
        ...item,
        images: images
          ? images.map(({ originalname, filename }) => ({
              originalFileName: originalname,
              url: `${req.protocol}://${req.get("host")}/static/${filename}`,
            }))
          : [],
      });
    } else {
      throw new Error("Product not found");
    }
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  uploadMiddleware,
  productValidator,
  validate,
  (req, res) => {
    const newProduct = new Product({
      createdBy: req.user.id,
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      images: req.files,
      isFeatured: req.body.is_featured || false,
    });

    newProduct.save().then((product) => res.json(product));
  }
);
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  uploadMiddleware,
  productValidator,
  validate,
  (req, res) => {
    Product.findById(req.params.id)
      .then((product) => {
        product.category = req.body.category;
        product.name = req.body.name;
        product.price = req.body.price;
        product.isFeatured = req.body.is_featured;
        if (req.files.length > 0) product.images = req.files;

        product
          .save()
          .then((product) => res.json(product))
          .catch((err) => {
            res.status(400).json({ message: "Error while updating product" });
          });
      })
      .catch((err) => {
        res.status(404).json({ message: "No product found" });
      });
  }
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  uploadMiddleware,
  (req, res) => {
    Product.findById(req.params.id)
      .then((product) => {
        product
          .delete()
          .then(() => {
            res.json({ message: "Product deleted successfully" });
          })
          .catch((err) => {
            res.status(400).json({ message: "Error while deleting product" });
          });
      })
      .catch((err) => {
        res.status(404).json({ message: "No product found" });
      });

    if (!product) {
    }
  }
);

module.exports = router;
