const express = require("express");
const { body } = require("express-validator");
const caregiverProfileController = require("../controllers/caregiverProfileController");
const auth = require("../middleware/auth");
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get("/", caregiverProfileController.getAllProfiles);
router.get("/:id", caregiverProfileController.getProfileById);
router.post(
  "/",
  auth,
  [
    body("bio").isString(),
    body("yearsOfExperience").isInt(),
    body("hourlyRate").isFloat(),
  ],
  caregiverProfileController.createProfile
);
router.put(
  "/:id",
  auth,
  [
    body("bio").optional().isString(),
    body("yearsOfExperience").optional().isInt(),
    body("hourlyRate").optional().isFloat(),
  ],
  caregiverProfileController.updateProfile
);

router.delete('/:id', auth, authorize(['caregiver']), caregiverProfileController.deleteProfile);

module.exports = router;
