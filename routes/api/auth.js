const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load models
const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route POST api/auth/register
// @desc Register user
// @access Public

router.post("/register", (req, res) => {

  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {

      const avatars = ["avatar1.jpg", "avatar2.jpg", "avatar3.jpg", "avatar4.jpg", "avatar5.jpg"];
      const statuss = ["hey there, i'm using orange chat!", "ornage chat rocks!", "sleeping..."];

      const newUser = new User({
        name: req.body.name,
        chats: [],
        email: req.body.email,
        password: req.body.password
      });
      const newProfile = new Profile({
        nickname: req.body.nickname,
        // lastSeen: Date.now,
        // lastEdited: Date.now,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        status: statuss[Math.floor(Math.random() * statuss.length)],
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {

              profile = {
                "_id": user._id,
                "nickname": newProfile.nickname,
                "lastSeen": newProfile.lastSeen,
                "lastEdited": newProfile.lastEdited,
                "avatar": newProfile.avatar,
                "status": newProfile.status,
              };

              Profile.collection.insert(profile)
              // newProfile.save()
                .then(profile => res.json(user))
                .catch(err => console.log(err));
              // res.json(user)
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;
