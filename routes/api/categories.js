const express = require("express");
const router = express.Router();
const passport = require("passport");

const Category = require("../../models/Category");
const { isAdmin } = require("../../middlewares/role");
const categoryValidator = require("../../validation/categories");
const validate = require("../../validation/validate");

router.get("/", (req, res) => {
  Category.find()
    .then((data) => res.json(data))
    .catch((err) => res.json({ message: "No result found" }));
});

router.get("/:id", (req, res) => {
  Category.findById(req.params.id)
    .then((data) => res.json(data))
    .catch((err) => res.status(404).json({ message: "Category not found" }));
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  categoryValidator,
  validate,
  (req, res) => {
    const newCategory = new Category({
      createdBy: req.user.id,
      name: req.body.name,
      description: req.body.description,
    });

    newCategory.save().then((data) => res.json(data));
  }
);
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  categoryValidator,
  validate,
  async (req, res) => {
    Category.findById(req.params.id)
      .then((category) => {
        category.name = req.body.name;
        category.description = req.body.description;

        category
          .save()
          .then((data) => res.json(data))
          .catch((err) => {
            res.status(400).json({ message: "Error while updating category" });
          });
      })
      .catch((err) => {
        res.status(404).json({ message: "Category not found" });
      });
  }
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  (req, res) => {
    Category.findById(req.params.id)
      .then((category) => {
        category
          .delete()
          .then(() => {
            res.json({ message: "Category deleted successfully" });
          })
          .catch((err) => {
            res.status(400).json({ message: "Error while deleting category" });
          });
      })
      .catch((err) => res.status(404).json({ message: "Category not found" }));
  }
);

module.exports = router;
