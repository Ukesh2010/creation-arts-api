const express = require("express");
const router = express.Router();
const Setting = require("../../models/Setting");
const passport = require("passport");
const { isAdmin } = require("../../middlewares/role");
const multer = require("multer");
const path = require("path");
const uniqueString = require("unique-string");

router.get("/", function (req, res) {
  Setting.findOne()
    .lean()
    .then(function (settings, error) {
      if (error) {
        return res.json(error).status(400);
      }
      return res.json({
        data: {
          url: `${req.protocol}://${req.get("host")}/static/${
            settings.bannerImage[0].filename
          }`,
          description: settings.description,
        },
      });
    });
});

const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
      cb(null, uniqueString() + path.extname(file.originalname));
    },
  }),
}).single("banner-image");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin(),
  uploadMiddleware,
  function (req, res) {
    Setting.findOne()
      .then(function (setting) {
        if (setting) {
          setting.bannerImage = req.file;
          setting.description = req.body.description;
        } else {
          setting = new Setting({
            bannerImage: req.file,
            description: req.body.description,
          });
        }

        setting
          .save()
          .then(function (setting) {
            return res.json({ data: setting });
          })
          .catch((error) => {
            return res.status(400).json({ error: error });
          });
      })
      .catch(function (error) {
        return res.status(400).json({ error: error });
      });
  }
);

module.exports = router;
