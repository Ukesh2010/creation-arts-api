const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../../models/User");
const keys = require("../../config/keys");
const registerValidator = require("../../validation/register");
const loginValidator = require("../../validation/login");
const validate = require("../../validation/validate");
const { sendPasswordResetLink } = require("../../services/sendEmail");

router.post("/register", registerValidator, validate, (req, res) => {
  const newUser = new User({
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => console.log(err));
    });
  });
});

router.post("/login", loginValidator, validate, (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user.id,
          role: user.role,
          email: user.email,
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({ success: true, token: token });
          }
        );
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    });
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "No user found with given email." });
      }

      res.json(user);
    });
  }
);

router.post("/forgot-password", (req, res) => {
  const email = req.body.email;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res
        .status(401)
        .json({ message: "No user found with given email." });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
      sendPasswordResetLink(user.email, token);
      res.json({ success: true, token: token });
    });
  });
});

router.post("/reset-password", (req, res) => {
  const password = req.body.password;
  const token = req.body.token;

  jwt.verify(token, keys.secretOrKey, (err, decoded) => {
    if (err) {
      res.status(400).json({ message: err.message || "Invalid token" });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            res.status(400).json({
              message: err.message || "Error while generating password hash",
            });
          } else {
            User.findById(decoded.id).then((user) => {
              user.password = hash;
              user
                .save()
                .then((user) => {
                  res
                    .status(200)
                    .json({ message: "Password reset successfully" });
                })
                .catch((err) => {
                  res.status(400).json({
                    message: err.message || "Error while resetting password",
                  });
                });
            });
          }
        });
      });
    }
  });
});

router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const oldPassword = req.body.old_password;
    const password = req.body.password;

    User.findById(req.user.id).then((user) => {
      if (!user) {
        res.status(401).json({ message: "No current user found." });
      } else {
        bcrypt.compare(oldPassword, user.password).then((isMatch) => {
          if (!isMatch) {
            res.status(401).json({ message: "Invalid old password" });
          } else {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                  res.status(400).json({
                    message:
                      err.message || "Error while generating password hash",
                  });
                } else {
                  user.password = hash;
                  user
                    .save()
                    .then((user) => {
                      res
                        .status(200)
                        .json({ message: "Password changed successfully" });
                    })
                    .catch((err) => {
                      res.status(400).json({
                        message: err.message || "Error while changing password",
                      });
                    });
                }
              });
            });
          }
        });
      }
    });
  }
);

router.put(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const name = req.body.name;
    const contactNo = req.body.contact_no;
    const fullAddress = req.body.full_address;
    User.findById(req.user.id).then((user) => {
      if (!user) {
        return res.status(401).json({ message: "No user found." });
      }
      user.name = name;
      user.contact_no = contactNo;
      user.full_address = fullAddress;
      user
        .save()
        .then((user) => {
          res
            .status(200)
            .json({ message: "User updated successfully", data: user });
        })
        .catch((err) => {
          res.status(400).json({
            message: err.message || "Error while updating user",
          });
        });
    });
  }
);

module.exports = router;
