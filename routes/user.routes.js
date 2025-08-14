const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, userController.getMe);
router.put(
  "/me",
  auth,
  [
    body("firstName").optional().isString(),
    body("lastName").optional().isString(),
    body("phoneNumber").optional().isString(),
    body("address").optional().isString(),
  ],
  userController.updateMe
);

module.exports = router;
