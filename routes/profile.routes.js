const express = require("express");
const { body } = require("express-validator");
const profileController = require("../controllers/profile.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/", profileController.getAllProfiles);
router.get("/:id", profileController.getProfileById);
router.post(
  "/",
  auth,
  [
    body("bio").not().isEmpty().withMessage("Bio is required.").isString(),
    body("yearsOfExperience")
      .isInt({ min: 0 })
      .withMessage("Years of experience must be a non-negative number."),
    body("hourlyRate")
      .isFloat({ gt: 0 })
      .withMessage("Hourly rate must be a positive number."),
  ],
  profileController.createProfile
);
router.put(
  "/:id",
  auth,
  [
    body("bio").optional().isString(),
    body("yearsOfExperience").optional().isInt({ min: 0 }),
    body("hourlyRate").optional().isFloat({ gt: 0 }),
  ],
  profileController.updateProfile
);

router.delete("/:id", auth, profileController.deleteProfile);

module.exports = router;
