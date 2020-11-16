const express = require("express");
const router = express.Router();
const passport = require("passport");

const Category = require("../../models/Category");
const validateCategoryInput = require("../../validation/categories");

router.get("/", (req, res) => {
  Category.find()
    .then((data) => res.json(data))
    .catch((err) => res.status(404).json({ message: "No categories found." }));
});

router.get("/:id", (req, res) => {
  Category.findById(req.params.id)
    .then((data) => res.json(data))
    .catch((err) =>
      res.status(404).json({ message: "No category found with that ID" })
    );
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCategoryInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newCategory = new Category({
      createdBy: req.user.id,
      name: req.body.name,
      description: req.body.description,
    });

    newCategory.save().then((data) => res.json(data));
  }
);

module.exports = router;
