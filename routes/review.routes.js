const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/caregiver/:caregiverId", reviewController.getReviewsForCaregiver);
router.post(
  "/",
  auth,
  [
    body("bookingId").isString(),
    body("caregiverId").isString(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString(),
  ],
  reviewController.createReview
);

module.exports = router;
